import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import SectionCommon from './section/section-common';
import {mkGetVisibleRootSuiteIds} from '../modules/selectors/tree';

class Suites extends Component {
    static propTypes = {
        errorGroupBrowserIds: PropTypes.array,
        // from store
        visibleRootSuiteIds: PropTypes.arrayOf(PropTypes.string)
    }

    render() {
        const {visibleRootSuiteIds, errorGroupBrowserIds} = this.props;

        return (
            <div className="sections">
                {visibleRootSuiteIds.map((suiteId) => {
                    const sectionProps = {
                        key: suiteId,
                        suiteId: suiteId,
                        errorGroupBrowserIds,
                        sectionRoot: true
                    };

                    return <SectionCommon {...sectionProps} />;
                })}
            </div>
        );
    }
}

export default connect(
    () => {
        const getVisibleRootSuiteIds = mkGetVisibleRootSuiteIds();

        return (state, {errorGroupBrowserIds}) => ({
            visibleRootSuiteIds: getVisibleRootSuiteIds(state, {errorGroupBrowserIds})
        });
    }
)(Suites);
