import React from 'react';
import {defaults} from 'lodash';
import proxyquire from 'proxyquire';
import {FAIL, SUCCESS} from 'lib/constants/test-statuses';
import {mkConnectedComponent} from '../utils';

describe('<SectionCommon/>', () => {
    const sandbox = sinon.sandbox.create();
    let SectionCommon, Title, SectionBrowser, selectors, hasSuiteFailedRetries, shouldSuiteBeShown, actionsStub;

    const mkSuite = (opts) => {
        const result = defaults(opts, {
            id: 'default-suite-id',
            parentId: null,
            name: 'default-name',
            status: SUCCESS,
            browserIds: []
        });

        return {[result.id]: result};
    };

    const mkStateTree = ({suitesById = {}} = {}) => {
        return {
            suites: {byId: suitesById}
        };
    };

    const mkSectionCommonComponent = (props = {}, initialState = {}) => {
        props = defaults(props, {
            suiteId: 'default-suite-id',
            errorGroupBrowserIds: []
        });
        initialState = defaults(initialState, {
            tree: mkStateTree(),
            view: {expand: 'all'}
        });

        return mkConnectedComponent(<SectionCommon {...props} />, {initialState});
    };

    beforeEach(() => {
        SectionBrowser = sandbox.stub().returns(null);
        Title = sandbox.stub().returns(null);
        hasSuiteFailedRetries = sandbox.stub().returns(false);
        shouldSuiteBeShown = sandbox.stub().returns(true);
        actionsStub = {toggleSuiteSection: sandbox.stub().returns({type: 'some-type'})};

        selectors = {
            mkHasSuiteFailedRetries: sandbox.stub().returns(hasSuiteFailedRetries),
            mkShouldSuiteBeShown: sandbox.stub().returns(shouldSuiteBeShown)
        };

        SectionCommon = proxyquire('lib/static/components/section/section-common', {
            '../../modules/actions': actionsStub,
            '../../modules/selectors/tree': selectors,
            './section-browser': {default: SectionBrowser},
            './title/simple': {default: Title}
        }).default;
    });

    afterEach(() => sandbox.restore());

    describe('expand retries', () => {
        it('should not render browser section if suite has not failed retries', () => {
            const suitesById = mkSuite({id: 'suite-1', name: 'suite', status: SUCCESS});
            const tree = mkStateTree({suitesById});
            hasSuiteFailedRetries.returns(false);

            mkSectionCommonComponent({suiteId: 'suite-1', sectionRoot: true}, {tree, view: {expand: 'retries'}});

            assert.notCalled(SectionBrowser);
        });

        it('should render browser section if suite has failed retries', () => {
            const suitesById = mkSuite({id: 'suite-1', name: 'suite', status: FAIL, browserIds: ['bro-1']});
            const tree = mkStateTree({suitesById});
            hasSuiteFailedRetries.returns(true);

            mkSectionCommonComponent(
                {suiteId: 'suite-1', sectionRoot: true, errorGroupBrowserIds: []},
                {tree, view: {expand: 'retries'}}
            );

            assert.calledOnceWith(SectionBrowser, {browserId: 'bro-1', errorGroupBrowserIds: []});
        });
    });

    describe('"toggleSuiteSection" action', () => {
        it('should call action on call passed handler in <Title /> component', () => {
            const suitesById = mkSuite({id: 'suite-1', name: 'suite', status: SUCCESS});
            const tree = mkStateTree({suitesById});
            hasSuiteFailedRetries.returns(false);

            mkSectionCommonComponent({suiteId: 'suite-1', sectionRoot: true}, {tree, view: {expand: 'all'}});
            Title.getCall(0).args[0].handler();

            assert.calledOnceWith(actionsStub.toggleSuiteSection, 'suite-1');
        });
    });
});
