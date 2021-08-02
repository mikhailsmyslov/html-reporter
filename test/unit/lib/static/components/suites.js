import React from 'react';
import proxyquire from 'proxyquire';
import {defaults, defaultsDeep} from 'lodash';

import {mkConnectedComponent} from './utils';
import {config} from 'lib/constants/defaults';
import viewModes from 'lib/constants/view-modes';

describe('<Suites/>', () => {
    const sandbox = sinon.sandbox.create();
    let Suites, SectionCommon, selectors, getVisibleRootSuiteIds;

    const mkSuitesComponent = (props = {}, initialState = {}) => {
        props = defaults(props, {
            errorGroupBrowserIds: []
        });

        initialState = defaultsDeep(initialState, {
            tree: {
                suites: {
                    allRootIds: ['default-root-id'],
                    failedRootIds: []
                }
            },
            view: {viewMode: viewModes.ALL, lazyLoadOffset: config.lazyLoadOffset}
        });

        return mkConnectedComponent(<Suites {...props} />, {initialState});
    };

    beforeEach(() => {
        SectionCommon = sinon.stub().returns(null);
        getVisibleRootSuiteIds = sinon.stub().returns([]);

        selectors = {
            mkGetVisibleRootSuiteIds: sandbox.stub().returns(getVisibleRootSuiteIds)
        };

        Suites = proxyquire('lib/static/components/suites', {
            './section/section-common': {default: SectionCommon},
            '../modules/selectors/tree': selectors
        }).default;
    });

    afterEach(() => sandbox.restore());

    it('should not render section common component if there are not visible root suite ids', () => {
        getVisibleRootSuiteIds.returns([]);

        mkSuitesComponent();

        assert.notCalled(SectionCommon);
    });

    it('should render few section commons components', () => {
        getVisibleRootSuiteIds.returns(['suite-id-1', 'suite-id-2']);

        mkSuitesComponent();

        assert.calledTwice(SectionCommon);
    });
});
