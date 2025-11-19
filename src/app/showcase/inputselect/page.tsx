'use client';

import { useState } from 'react';
import {
  InputSelect,
  type InputSelectOption,
} from '@pointwise/app/components/ui/InputSelect';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';

const SIMPLE_OPTIONS: InputSelectOption<string>[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

const CATEGORY_OPTIONS: InputSelectOption<string>[] = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'learning', label: 'Learning' },
];

const OPTIONS_WITH_DESCRIPTIONS: InputSelectOption<string>[] = [
  {
    value: 'daily',
    label: 'Daily',
    description: 'Repeats every day',
  },
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Repeats once per week',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: 'Repeats once per month',
  },
];

const PRIORITY_OPTIONS: InputSelectOption<'low' | 'medium' | 'high'>[] = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
];

export default function InputSelectShowcasePage() {
  const [simpleValue, setSimpleValue] = useState<string>('');
  const [categoryValue, setCategoryValue] = useState<string>('');
  const [recurrenceValue, setRecurrenceValue] = useState<string>('');
  const [priorityValue, setPriorityValue] = useState<'low' | 'medium' | 'high'>(
    'low',
  );
  const [primaryValue, setPrimaryValue] = useState<string>('');
  const [secondaryValue, setSecondaryValue] = useState<string>('');
  const [dangerValue, setDangerValue] = useState<string>('');
  const [xsValue, setXsValue] = useState<string>('');
  const [smValue, setSmValue] = useState<string>('');
  const [mdValue, setMdValue] = useState<string>('');
  const [lgValue, setLgValue] = useState<string>('');
  const [xlValue, setXlValue] = useState<string>('');
  const [errorValue, setErrorValue] = useState<string>('');
  const [disabledValue, setDisabledValue] = useState<string>('option1');
  const [requiredValue, setRequiredValue] = useState<string>('');

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            InputSelect Component Showcase
          </h1>
          <p className="text-sm text-zinc-400">
            Display of InputSelect component variants, sizes, and use cases
          </p>
        </div>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
          <p className="text-xs text-zinc-500">
            Different visual styles for different contexts
          </p>
          <div className="space-y-4 max-w-md">
            <InputSelect
              variant="primary"
              label="Primary Variant"
              value={primaryValue}
              onChange={setPrimaryValue}
              options={SIMPLE_OPTIONS}
              placeholder="Select an option..."
            />
            <InputSelect
              variant="secondary"
              label="Secondary Variant"
              value={secondaryValue}
              onChange={setSecondaryValue}
              options={SIMPLE_OPTIONS}
              placeholder="Select an option..."
            />
            <InputSelect
              variant="danger"
              label="Danger Variant"
              value={dangerValue}
              onChange={setDangerValue}
              options={SIMPLE_OPTIONS}
              placeholder="Select an option..."
            />
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
          <p className="text-xs text-zinc-500">
            Size variants matching Input/InputArea component system
          </p>
          <div className="space-y-4 max-w-md">
            <InputSelect
              size="xs"
              label="Extra Small (xs)"
              value={xsValue}
              onChange={setXsValue}
              options={SIMPLE_OPTIONS}
            />
            <InputSelect
              size="sm"
              label="Small (sm)"
              value={smValue}
              onChange={setSmValue}
              options={SIMPLE_OPTIONS}
            />
            <InputSelect
              size="md"
              label="Medium (md) - default"
              value={mdValue}
              onChange={setMdValue}
              options={SIMPLE_OPTIONS}
            />
            <InputSelect
              size="lg"
              label="Large (lg)"
              value={lgValue}
              onChange={setLgValue}
              options={SIMPLE_OPTIONS}
            />
            <InputSelect
              size="xl"
              label="Extra Large (xl)"
              value={xlValue}
              onChange={setXlValue}
              options={SIMPLE_OPTIONS}
            />
          </div>
        </section>

        {/* Variant × Size Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Variant × Size Matrix
          </h2>
          <div className="space-y-6">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={size} className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                  Size: {size}
                </h3>
                <div className="flex flex-wrap gap-4 max-w-2xl">
                  <InputSelect
                    variant="primary"
                    size={size}
                    value={simpleValue}
                    onChange={setSimpleValue}
                    options={SIMPLE_OPTIONS}
                    placeholder="Primary"
                  />
                  <InputSelect
                    variant="secondary"
                    size={size}
                    value={simpleValue}
                    onChange={setSimpleValue}
                    options={SIMPLE_OPTIONS}
                    placeholder="Secondary"
                  />
                  <InputSelect
                    variant="danger"
                    size={size}
                    value={simpleValue}
                    onChange={setSimpleValue}
                    options={SIMPLE_OPTIONS}
                    placeholder="Danger"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">States</h2>
          <div className="space-y-4 max-w-md">
            <InputSelect
              label="With Error"
              error="Please select a valid option"
              value={errorValue}
              onChange={setErrorValue}
              options={SIMPLE_OPTIONS}
            />
            <InputSelect
              label="Disabled"
              value={disabledValue}
              onChange={setDisabledValue}
              options={SIMPLE_OPTIONS}
              disabled
            />
            <InputSelect
              label="Required Field"
              required
              value={requiredValue}
              onChange={setRequiredValue}
              options={SIMPLE_OPTIONS}
            />
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Use Cases</h2>
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Category Selection
              </h3>
              <InputSelect
                label="Task Category"
                value={categoryValue}
                onChange={setCategoryValue}
                options={CATEGORY_OPTIONS}
                placeholder="Choose a category"
                description="Select the category this task belongs to"
              />
            </div>

            {/* Options with Descriptions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Options with Descriptions
              </h3>
              <InputSelect
                label="Recurrence"
                value={recurrenceValue}
                onChange={setRecurrenceValue}
                options={OPTIONS_WITH_DESCRIPTIONS}
                placeholder="Select recurrence pattern"
              />
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Priority Selection
              </h3>
              <InputSelect
                label="Priority"
                value={priorityValue}
                onChange={setPriorityValue}
                options={PRIORITY_OPTIONS}
              />
            </div>
          </div>
        </section>

        {/* Full Width */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Full Width</h2>
          <InputSelect
            label="Full Width Select"
            fullWidth
            value={simpleValue}
            onChange={setSimpleValue}
            options={SIMPLE_OPTIONS}
            placeholder="This select takes full width"
          />
        </section>

        {/* Comparison with FormSelect */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Comparison with FormSelect
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300">
                InputSelect (New)
              </h3>
              <InputSelect
                label="Category"
                value={categoryValue}
                onChange={setCategoryValue}
                options={CATEGORY_OPTIONS}
                description="Uses InputHeader, consistent with Input/InputArea"
              />
              <p className="text-xs text-zinc-500">
                ✅ Integrated label/error/description handling
                <br />
                ✅ Consistent variant/size system
                <br />✅ No FormField wrapper needed
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
