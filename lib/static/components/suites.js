import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller} from 'react-virtualized';
import ResizeObserver from 'rc-resize-observer';

import SectionCommon from './section/section-common';
import {mkGetVisibleRootSuiteIds} from '../modules/selectors/tree';

class Suites extends Component {
    static propTypes = {
        errorGroupBrowserIds: PropTypes.array,
        // from store
        visibleRootSuiteIds: PropTypes.arrayOf(PropTypes.string)
    }

    _suitesMeasurementCache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 250
    });

    _renderRow = ({index, key, style, parent}) => {
        const {visibleRootSuiteIds, errorGroupBrowserIds} = this.props;
        const suiteId = visibleRootSuiteIds[index];
        const sectionProps = {
            key: suiteId,
            suiteId: suiteId,
            errorGroupBrowserIds,
            sectionRoot: true
        };

        return (
            <CellMeasurer
                key={key}
                cache={this._suitesMeasurementCache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                {({measure}) => (
                    <div key={key} style={style}>
                        <ResizeObserver onResize={measure}>
                            <SectionCommon {...sectionProps} />
                        </ResizeObserver>
                    </div>
                )}
            </CellMeasurer>
        );
    }

    render() {
        const {visibleRootSuiteIds} = this.props;

        return (
            <div className="sections">
                <WindowScroller>
                    {({height, isScrolling, onChildScroll, scrollTop, registerChild}) => (
                        <AutoSizer disableHeight>
                            {({width}) => (
                                /**
                                 * To correctly render lists on groupByError mode
                                 * @see - https://github.com/bvaughn/react-virtualized/issues/1324
                                 */
                                <div ref={el => registerChild(el)}>
                                    <List
                                        autoHeight
                                        height={height}
                                        width={width}
                                        isScrolling={isScrolling}
                                        onScroll={onChildScroll}
                                        scrollTop={scrollTop}
                                        deferredMeasurementCache={this._suitesMeasurementCache}
                                        rowHeight={this._suitesMeasurementCache.rowHeight}
                                        rowCount={visibleRootSuiteIds.length}
                                        rowRenderer={this._renderRow}
                                        style={{willChange: 'auto'}} // disable `will-change: transform` to correctly render diff circle
                                    />
                                </div>
                            )}
                        </AutoSizer>
                    )}
                </WindowScroller>
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
