import React from 'react';
import Icon from './Icon.jsx';
import '../../styles/TabSelector.css';


const TabSelector = ({ tabs, defaultActiveTabName, onTabSelect }) => {

    const [activeTabName, setActiveTabName] = React.useState(defaultActiveTabName);

    return (
        <div className="TabSelector">
            { tabs.map((tab) => (
                <button
                    key={ tab.name }
                    className={ activeTabName === tab.name ? 'TabSelectorItem TabSelectorItem_active' : 'TabSelectorItem' }
                    onClick={
                        () => {
                            setActiveTabName(tab.name);
                            onTabSelect(tab)
                        }
                    }
                    disabled={ !!tab.disabled }
                >
                    { tab.icon && <Icon name={ tab.icon } size={ 28 } className="TabSelectorItem_icon"/> }
                    { tab.label && <span className="TabSelectorItem_label">{ tab.label }</span> }
                </button>
            )) }
        </div>
    );
};

export default TabSelector;
