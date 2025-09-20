import React from 'react';
import Icon from './Icon.jsx';
import '../../styles/TabSelector.css';
import Tooltip from './Tooltip.jsx';


const TabSelector = ({ tabs, defaultActiveTabName, onTabSelect }) => {

    const [activeTabName, setActiveTabName] = React.useState(defaultActiveTabName);

    return (
        <div className="TabSelector">
            { tabs.map((tab, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === tabs.length - 1;
                return (
                    <Tooltip
                        enabled={tab.tooltipLabel || tab.disabled}
                        label={tab.disabled ? 'В разработке' : tab.tooltipLabel}
                        key={tab.name}
                    >
                        <button
                            key={tab.name}
                            className={
                                'TabSelectorItem' +
                                (activeTabName === tab.name ? ' TabSelectorItem_active' : '') +
                                (isFirst ? ' TabSelectorItem_first' : '') +
                                (isLast ? ' TabSelectorItem_last' : '')
                            }
                            onClick={() => {
                                setActiveTabName(tab.name);
                                onTabSelect(tab)
                            }}
                            disabled={!!tab.disabled}
                        >
                            {tab.icon && <Icon name={tab.icon} size={28} className="TabSelectorItem_icon" />}
                            {tab.label && <span className="TabSelectorItem_label">{tab.label}</span>}
                        </button>
                    </Tooltip>
                );
            })}
        </div>
    );
};

export default TabSelector;
