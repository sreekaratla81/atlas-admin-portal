import React from "react";

type TabItem = {
  key: string;
  label: string;
};

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="shell-tabs" role="tablist" aria-label="Queues">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={tab.key === activeKey}
          className={["shell-tab", tab.key === activeKey ? "active" : ""].join(" ")}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
