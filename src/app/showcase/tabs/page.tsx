"use client";

import BackgroundGlow from "@pointwise/app/components/ui/BackgroundGlow";
import { Card } from "@pointwise/app/components/ui/Card";
import { Tabs } from "@pointwise/app/components/ui/Tabs";
import { useState } from "react";
import { FiHome, FiMail, FiSettings, FiStar, FiUser } from "react-icons/fi";

export default function TabsShowcasePage() {
  const [basicTab, setBasicTab] = useState("tab1");
  const [variantTab, setVariantTab] = useState("tab1");
  const [filterTab, setFilterTab] = useState("day");
  const [analyticsTab, setAnalyticsTab] = useState("7d");
  const [sizeTab, setSizeTab] = useState("tab1");
  const [iconTab, setIconTab] = useState("home");
  const [disabledTab, setDisabledTab] = useState("tab1");
  const [multiTab, setMultiTab] = useState("tab1");

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tabs Component Showcase</h1>
          <p className="text-sm text-zinc-400">
            Display of Tabs component variants, sizes, and use cases
          </p>
        </div>

        {/* Basic Usage */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Basic Usage</h2>
          <p className="text-xs text-zinc-500">
            Simple two-tab example (like authentication page)
          </p>
          <Card variant="primary" responsivePadding>
            <Tabs
              items={[
                { id: "tab1", label: "Sign In" },
                { id: "tab2", label: "Sign Up" },
              ]}
              value={basicTab}
              onChange={setBasicTab}
            />
            <div className="mt-4">
              <p className="text-sm text-zinc-300">
                Active tab: <span className="font-semibold">{basicTab}</span>
              </p>
            </div>
          </Card>
        </section>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
          <p className="text-xs text-zinc-500">
            Different visual styles for tabs
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Primary Variant (Default)
              </h3>
              <Tabs
                items={[
                  { id: "tab1", label: "Tab 1" },
                  { id: "tab2", label: "Tab 2" },
                  { id: "tab3", label: "Tab 3" },
                ]}
                value={variantTab}
                onChange={setVariantTab}
                variant="primary"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Secondary Variant
              </h3>
              <Tabs
                items={[
                  { id: "tab1", label: "Tab 1" },
                  { id: "tab2", label: "Tab 2" },
                  { id: "tab3", label: "Tab 3" },
                ]}
                value={variantTab}
                onChange={setVariantTab}
                variant="secondary"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Filter Variant (for filters/options)
              </h3>
              <Tabs
                items={[
                  { id: "day", label: "Day" },
                  { id: "week", label: "Week" },
                  { id: "month", label: "Month" },
                ]}
                value={filterTab}
                onChange={setFilterTab}
                variant="filter"
                fullWidth={false}
              />
            </div>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
          <p className="text-xs text-zinc-500">
            Different size options for tabs
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Small</h3>
              <Tabs
                items={[
                  { id: "tab1", label: "Small Tab 1" },
                  { id: "tab2", label: "Small Tab 2" },
                ]}
                value={sizeTab}
                onChange={setSizeTab}
                size="sm"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Medium (Default)
              </h3>
              <Tabs
                items={[
                  { id: "tab1", label: "Medium Tab 1" },
                  { id: "tab2", label: "Medium Tab 2" },
                ]}
                value={sizeTab}
                onChange={setSizeTab}
                size="md"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Large</h3>
              <Tabs
                items={[
                  { id: "tab1", label: "Large Tab 1" },
                  { id: "tab2", label: "Large Tab 2" },
                ]}
                value={sizeTab}
                onChange={setSizeTab}
                size="lg"
              />
            </div>
          </div>
        </section>

        {/* With Icons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">With Icons</h2>
          <p className="text-xs text-zinc-500">
            Tabs can include icons alongside labels
          </p>
          <Tabs
            items={[
              { id: "home", label: "Home", icon: <FiHome /> },
              { id: "settings", label: "Settings", icon: <FiSettings /> },
              { id: "profile", label: "Profile", icon: <FiUser /> },
            ]}
            value={iconTab}
            onChange={setIconTab}
          />
          <div className="mt-4">
            <p className="text-sm text-zinc-300">
              Active tab: <span className="font-semibold">{iconTab}</span>
            </p>
          </div>
        </section>

        {/* Disabled State */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Disabled State
          </h2>
          <p className="text-xs text-zinc-500">
            Tabs can be disabled individually
          </p>
          <Tabs
            items={[
              { id: "tab1", label: "Active Tab" },
              { id: "tab2", label: "Disabled Tab", disabled: true },
              { id: "tab3", label: "Another Active Tab" },
            ]}
            value={disabledTab}
            onChange={setDisabledTab}
          />
        </section>

        {/* Multiple Tabs */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Multiple Tabs</h2>
          <p className="text-xs text-zinc-500">
            Tabs component supports any number of tabs
          </p>
          <Tabs
            items={[
              { id: "tab1", label: "First" },
              { id: "tab2", label: "Second" },
              { id: "tab3", label: "Third" },
              { id: "tab4", label: "Fourth" },
              { id: "tab5", label: "Fifth" },
            ]}
            value={multiTab}
            onChange={setMultiTab}
          />
          <div className="mt-4">
            <p className="text-sm text-zinc-300">
              Active tab: <span className="font-semibold">{multiTab}</span>
            </p>
          </div>
        </section>

        {/* Full Width vs Inline */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Full Width vs Inline
          </h2>
          <p className="text-xs text-zinc-500">
            Tabs can take full width or be inline
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Full Width (Default)
              </h3>
              <Tabs
                items={[
                  { id: "tab1", label: "Tab 1" },
                  { id: "tab2", label: "Tab 2" },
                ]}
                value={basicTab}
                onChange={setBasicTab}
                fullWidth
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Inline</h3>
              <Tabs
                items={[
                  { id: "tab1", label: "Tab 1" },
                  { id: "tab2", label: "Tab 2" },
                ]}
                value={basicTab}
                onChange={setBasicTab}
                fullWidth={false}
              />
            </div>
          </div>
        </section>

        {/* Filter Variant Use Cases */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Filter Variant Use Cases
          </h2>
          <p className="text-xs text-zinc-500">
            The filter variant is designed for option selectors and filters,
            similar to Analytics range selectors
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                TaskBoard View Mode (Day/Week/Month)
              </h3>
              <Card variant="primary" responsivePadding>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
                      Today, Dec 15
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400 hover:text-white">
                        ⟨ Prev
                      </button>
                      <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400 hover:text-white">
                        Today
                      </button>
                      <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400 hover:text-white">
                        Next ⟩
                      </button>
                    </div>
                  </div>
                  <Tabs
                    items={[
                      { id: "day", label: "Day" },
                      { id: "week", label: "Week" },
                      { id: "month", label: "Month" },
                    ]}
                    value={filterTab}
                    onChange={setFilterTab}
                    variant="filter"
                    fullWidth={false}
                  />
                </div>
              </Card>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Analytics Range Selector (7d, 14d, 30d)
              </h3>
              <Card variant="primary" responsivePadding>
                <div className="flex items-center justify-end">
                  <Tabs
                    items={[
                      { id: "7d", label: "7D" },
                      { id: "14d", label: "14D" },
                      { id: "30d", label: "30D" },
                    ]}
                    value={analyticsTab}
                    onChange={setAnalyticsTab}
                    variant="filter"
                    size="md"
                    fullWidth={false}
                  />
                </div>
              </Card>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Filter Variant Sizes
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Small</p>
                  <Tabs
                    items={[
                      { id: "day", label: "Day" },
                      { id: "week", label: "Week" },
                      { id: "month", label: "Month" },
                    ]}
                    value={filterTab}
                    onChange={setFilterTab}
                    variant="filter"
                    size="sm"
                    fullWidth={false}
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Medium (Default)</p>
                  <Tabs
                    items={[
                      { id: "day", label: "Day" },
                      { id: "week", label: "Week" },
                      { id: "month", label: "Month" },
                    ]}
                    value={filterTab}
                    onChange={setFilterTab}
                    variant="filter"
                    size="md"
                    fullWidth={false}
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Large</p>
                  <Tabs
                    items={[
                      { id: "day", label: "Day" },
                      { id: "week", label: "Week" },
                      { id: "month", label: "Month" },
                    ]}
                    value={filterTab}
                    onChange={setFilterTab}
                    variant="filter"
                    size="lg"
                    fullWidth={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-world Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Real-world Example
          </h2>
          <p className="text-xs text-zinc-500">
            Example usage in a card with content switching
          </p>
          <Card variant="primary" responsivePadding>
            <Tabs
              items={[
                { id: "inbox", label: "Inbox", icon: <FiMail /> },
                { id: "starred", label: "Starred", icon: <FiStar /> },
                { id: "settings", label: "Settings", icon: <FiSettings /> },
              ]}
              value={iconTab}
              onChange={setIconTab}
            />
            <div className="mt-6">
              {iconTab === "inbox" && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Inbox</h3>
                  <p className="text-sm text-zinc-400">
                    Your inbox messages will appear here.
                  </p>
                </div>
              )}
              {iconTab === "starred" && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Starred</h3>
                  <p className="text-sm text-zinc-400">
                    Your starred items will appear here.
                  </p>
                </div>
              )}
              {iconTab === "settings" && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <p className="text-sm text-zinc-400">
                    Your settings will appear here.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Code Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Usage Example</h2>
          <Card variant="secondary">
            <pre className="text-xs text-zinc-400 overflow-x-auto">
              <code>{`import { Tabs } from '@pointwise/app/components/ui/Tabs';
import { useState } from 'react';

// Standard tabs (primary/secondary variants)
function MyComponent() {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Tabs
      items={[
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', icon: <Icon /> },
        { id: 'tab3', label: 'Tab 3', disabled: true },
      ]}
      value={activeTab}
      onChange={setActiveTab}
      variant="primary"
      size="md"
      fullWidth
    />
  );
}

// Filter variant (for options/filters)
function FilterComponent() {
  const [viewMode, setViewMode] = useState('day');

  return (
    <Tabs
      items={[
        { id: 'day', label: 'Day' },
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
      ]}
      value={viewMode}
      onChange={setViewMode}
      variant="filter"
      size="md"
      fullWidth={false}
    />
  );
}`}</code>
            </pre>
          </Card>
        </section>
      </div>
    </div>
  );
}
