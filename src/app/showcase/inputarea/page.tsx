'use client';

import { useState } from 'react';
import { InputArea } from '@pointwise/app/components/ui/InputArea';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';

export default function InputAreaShowcasePage() {
  const [notes, setNotes] = useState('');
  const [context, setContext] = useState('');
  const [errorNotes, setErrorNotes] = useState<string | false>(false);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            InputArea Component Showcase
          </h1>
          <p className="text-sm text-zinc-400">
            Display of InputArea component variants, sizes, and use cases
          </p>
        </div>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
          <p className="text-xs text-zinc-500">
            Different visual styles for different contexts
          </p>
          <div className="space-y-4 max-w-md">
            <InputArea
              variant="primary"
              placeholder="Primary variant (task notes)"
              name="primary-variant"
              defaultValue=""
            />
            <InputArea
              variant="secondary"
              placeholder="Secondary variant (comments)"
              name="secondary-variant"
              defaultValue=""
            />
            <InputArea
              variant="danger"
              placeholder="Danger variant (error state)"
              name="danger-variant"
              defaultValue=""
            />
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
          <p className="text-xs text-zinc-500">
            Different sizes for different use cases
          </p>
          <div className="space-y-4 max-w-md">
            <InputArea
              size="xs"
              placeholder="Extra small"
              name="xs-size"
              defaultValue=""
              rows={2}
            />
            <InputArea
              size="sm"
              placeholder="Small"
              name="sm-size"
              defaultValue=""
              rows={3}
            />
            <InputArea
              size="md"
              placeholder="Medium (default)"
              name="md-size"
              defaultValue=""
            />
            <InputArea
              size="lg"
              placeholder="Large"
              name="lg-size"
              defaultValue=""
              rows={5}
            />
            <InputArea
              size="xl"
              placeholder="Extra large"
              name="xl-size"
              defaultValue=""
              rows={6}
            />
          </div>
        </section>

        {/* Labels and Descriptions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Labels and Descriptions
          </h2>
          <p className="text-xs text-zinc-500">
            Provide context and guidance to users
          </p>
          <div className="space-y-4 max-w-md">
            <InputArea
              label="Task Notes"
              placeholder="Add extra detail, links, or reminders"
              name="labeled-InputArea"
              defaultValue=""
            />
            <InputArea
              label="Description"
              description="Provide a detailed description of the task"
              placeholder="Enter description here..."
              name="described-InputArea"
              defaultValue=""
            />
            <InputArea
              label="Required Field"
              required
              placeholder="This field is required"
              name="required-InputArea"
              defaultValue=""
            />
          </div>
        </section>

        {/* Error States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Error States</h2>
          <p className="text-xs text-zinc-500">
            Display validation errors and feedback
          </p>
          <div className="space-y-4 max-w-md">
            <InputArea
              label="Notes"
              error="This field is required"
              placeholder="Enter notes here..."
              name="error-InputArea"
              defaultValue=""
            />
            <InputArea
              label="Context"
              error={true}
              placeholder="Error state without message"
              name="error-boolean-InputArea"
              defaultValue=""
            />
            <InputArea
              variant="danger"
              label="Danger Variant with Error"
              error="Maximum length exceeded"
              placeholder="Danger variant shows error styling"
              name="danger-error-InputArea"
              defaultValue=""
            />
          </div>
        </section>

        {/* Disabled States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Disabled States
          </h2>
          <p className="text-xs text-zinc-500">
            Disabled InputAreas for read-only or locked content
          </p>
          <div className="space-y-4 max-w-md">
            <InputArea
              label="Disabled InputArea"
              disabled
              placeholder="This field is disabled"
              name="disabled-InputArea"
              defaultValue="This content cannot be edited"
            />
            <InputArea
              variant="secondary"
              label="Disabled Secondary"
              disabled
              placeholder="Disabled secondary variant"
              name="disabled-secondary-InputArea"
              defaultValue=""
            />
          </div>
        </section>

        {/* Full Width */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Full Width</h2>
          <p className="text-xs text-zinc-500">
            InputAreas that span the full width of their container
          </p>
          <div className="space-y-4">
            <InputArea
              label="Full Width InputArea"
              fullWidth
              placeholder="This InputArea spans the full width"
              name="fullwidth-InputArea"
              defaultValue=""
            />
          </div>
        </section>

        {/* Character Count */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Character Count
          </h2>
          <p className="text-xs text-zinc-500">
            Display character count with warning and error thresholds
          </p>
          <div className="space-y-4 max-w-md">
            <InputArea
              label="Notes"
              showCharCount
              maxLength={200}
              placeholder="Type to see character count..."
              name="charcount-InputArea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <InputArea
              label="Custom Thresholds"
              showCharCount
              maxLength={500}
              charCountWarningThreshold={60}
              charCountErrorThreshold={85}
              placeholder="Custom warning/error thresholds..."
              name="custom-threshold-InputArea"
              defaultValue=""
            />
          </div>
        </section>

        {/* Progress Bar */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Progress Bar</h2>
          <p className="text-xs text-zinc-500">
            Visual progress indicator for character limits
          </p>
          <div className="space-y-4 max-w-md">
            <InputArea
              label="With Progress Bar"
              showProgressBar
              maxLength={1000}
              placeholder="Type to see progress bar fill..."
              name="progressbar-InputArea"
              defaultValue=""
            />
            <InputArea
              label="Both Count and Progress"
              showCharCount
              showProgressBar
              maxLength={500}
              placeholder="Character count and progress bar together..."
              name="both-InputArea"
              defaultValue=""
            />
          </div>
        </section>

        {/* Task Notes Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Task Notes Example
          </h2>
          <p className="text-xs text-zinc-500">
            Real-world example for task creation context/notes field
          </p>
          <div className="space-y-4 max-w-md">
            <InputArea
              label="Context / notes"
              showCharCount
              showProgressBar
              maxLength={5000}
              charCountWarningThreshold={80}
              charCountErrorThreshold={95}
              placeholder="Add extra detail, links, or reminders"
              name="context"
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                if (e.target.value.length > 5000) {
                  setErrorNotes(
                    `Context must be 5000 characters or fewer (currently ${e.target.value.length})`,
                  );
                } else {
                  setErrorNotes(false);
                }
              }}
              error={errorNotes}
            />
          </div>
        </section>

        {/* Interactive Form Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Interactive Form Example
          </h2>
          <p className="text-xs text-zinc-500">
            Multiple InputAreas working together in a form
          </p>
          <form
            className="space-y-6 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Form submitted!');
            }}
          >
            <InputArea
              label="Task Description"
              required
              showCharCount
              maxLength={500}
              placeholder="Describe the task..."
              name="description"
              defaultValue=""
            />

            <InputArea
              label="Additional Notes"
              description="Optional: Add any extra context or reminders"
              showCharCount
              maxLength={1000}
              placeholder="Add notes here..."
              name="notes"
              defaultValue=""
            />

            <InputArea
              label="Comments"
              variant="secondary"
              placeholder="Add comments..."
              name="comments"
              rows={3}
              defaultValue=""
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              Submit Form
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
