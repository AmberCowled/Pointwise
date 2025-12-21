"use client";

// AuthCard has been replaced with Card component
import TaskSectionCard from "@pointwise/app/components/dashboard/task-board/TaskSectionCard";
import BackgroundGlow from "@pointwise/app/components/ui/BackgroundGlow";
import { Button } from "@pointwise/app/components/ui/Button";
import { Card } from "@pointwise/app/components/ui/Card";

// Helper component to display code snippets
function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className="mt-4 p-4 rounded-lg bg-zinc-900/80 border border-white/5 overflow-x-auto">
      <code className="text-xs text-zinc-300 font-mono whitespace-pre">
        {code}
      </code>
    </pre>
  );
}

export default function CardsShowcasePage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Card Component Showcase</h1>
          <p className="text-sm text-zinc-400">
            Display of Card component variants and use cases
          </p>
        </div>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
          <div className="space-y-4">
            <Card variant="primary">
              <p className="text-sm text-zinc-300">
                Primary variant - Default card with shadow
              </p>
            </Card>
            <CodeSnippet
              code={`<Card variant="primary">
  <p className="text-sm text-zinc-300">
    Primary variant - Default card with shadow
  </p>
</Card>`}
            />
            <Card variant="secondary">
              <p className="text-sm text-zinc-300">
                Secondary variant - Section card with larger radius
              </p>
            </Card>
            <CodeSnippet
              code={`<Card variant="secondary">
  <p className="text-sm text-zinc-300">
    Secondary variant - Section card with larger radius
  </p>
</Card>`}
            />
            <Card variant="danger">
              <p className="text-sm">
                Danger variant - Error/alert card with rose styling
              </p>
            </Card>
            <CodeSnippet
              code={`<Card variant="danger">
  <p className="text-sm">
    Danger variant - Error/alert card with rose styling
  </p>
</Card>`}
            />
          </div>
        </section>

        {/* Simple Card */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Simple Card</h2>
          <p className="text-xs text-zinc-500">
            Card with just content, no header
          </p>
          <Card variant="primary">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Simple Content</h3>
              <p className="text-sm text-zinc-400">
                This is a simple card wrapper. It provides a consistent
                background, border, and padding for content.
              </p>
            </div>
          </Card>
          <CodeSnippet
            code={`<Card variant="primary">
  <div className="space-y-3">
    <h3 className="text-lg font-semibold">Simple Content</h3>
    <p className="text-sm text-zinc-400">
      This is a simple card wrapper. It provides a consistent
      background, border, and padding for content.
    </p>
  </div>
</Card>`}
          />
        </section>

        {/* Card with Title */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Card with Title
          </h2>
          <p className="text-xs text-zinc-500">Card with title in header</p>
          <Card variant="secondary" title="Task List">
            <p className="text-sm text-zinc-400">
              Content area (header will appear above this)
            </p>
          </Card>
          <CodeSnippet
            code={`<Card variant="secondary" title="Task List">
  <p className="text-sm text-zinc-400">
    Content area (header will appear above this)
  </p>
</Card>`}
          />
        </section>

        {/* Card with Title and Label */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Card with Title and Label
          </h2>
          <p className="text-xs text-zinc-500">
            Card with label (eyebrow) and title
          </p>
          <Card variant="secondary" title="Task List" label="Overview">
            <p className="text-sm text-zinc-400">
              Content area (header with label and title will appear above this)
            </p>
          </Card>
          <CodeSnippet
            code={`<Card variant="secondary" title="Task List" label="Overview">
  <p className="text-sm text-zinc-400">
    Content area (header with label and title will appear above this)
  </p>
</Card>`}
          />
        </section>

        {/* Card with Action */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Card with Action
          </h2>
          <p className="text-xs text-zinc-500">Card with action button</p>
          <Card
            variant="secondary"
            title="Task List"
            action={
              <Button size="sm" variant="secondary">
                Create Task
              </Button>
            }
          >
            <p className="text-sm text-zinc-400">
              Content area (header with action will appear above this)
            </p>
          </Card>
          <CodeSnippet
            code={`<Card
  variant="secondary"
  title="Task List"
  action={
    <Button size="sm" variant="secondary">
      Create Task
    </Button>
  }
>
  <p className="text-sm text-zinc-400">
    Content area (header with action will appear above this)
  </p>
</Card>`}
          />
        </section>

        {/* Card with Multiple Actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Card with Multiple Actions
          </h2>
          <p className="text-xs text-zinc-500">
            Card with array of action buttons
          </p>
          <Card
            variant="secondary"
            title="Optional Tasks"
            action={[
              <Button key="filter" size="sm" variant="secondary">
                Filter
              </Button>,
              <Button key="sort" size="sm" variant="secondary">
                Sort
              </Button>,
            ]}
          >
            <p className="text-sm text-zinc-400">
              Content area (header with multiple actions will appear above this)
            </p>
          </Card>
          <CodeSnippet
            code={`<Card
  variant="secondary"
  title="Optional Tasks"
  action={[
    <Button key="filter" size="sm" variant="secondary">
      Filter
    </Button>,
    <Button key="sort" size="sm" variant="secondary">
      Sort
    </Button>,
  ]}
>
  <p className="text-sm text-zinc-400">
    Content area (header with multiple actions will appear above this)
  </p>
</Card>`}
          />
        </section>

        {/* Card with Full Header */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Card with Full Header
          </h2>
          <p className="text-xs text-zinc-500">
            Card with label, title, and action
          </p>
          <Card
            variant="secondary"
            title="Task List"
            label="Overview"
            action={
              <Button size="sm" variant="secondary">
                Create Task
              </Button>
            }
          >
            <div className="space-y-2">
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-sm text-zinc-300">Task item example</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-sm text-zinc-300">Another task item</p>
              </div>
            </div>
          </Card>
          <CodeSnippet
            code={`<Card
  variant="secondary"
  title="Task List"
  label="Overview"
  action={
    <Button size="sm" variant="secondary">
      Create Task
    </Button>
  }
>
  <div className="space-y-2">
    <div className="rounded-lg border border-white/5 bg-white/5 p-3">
      <p className="text-sm text-zinc-300">Task item example</p>
    </div>
    <div className="rounded-lg border border-white/5 bg-white/5 p-3">
      <p className="text-sm text-zinc-300">Another task item</p>
    </div>
  </div>
</Card>`}
          />
        </section>

        {/* Responsive Padding */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Responsive Padding
          </h2>
          <p className="text-xs text-zinc-500">
            Card with responsive padding (like AuthCard)
          </p>
          <Card variant="primary" responsivePadding>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Auth-Style Card</h3>
              <p className="text-sm text-zinc-400">
                This card uses responsive padding (p-6 on mobile, p-8 on larger
                screens)
              </p>
            </div>
          </Card>
          <CodeSnippet
            code={`<Card variant="primary" responsivePadding>
  <div className="space-y-3">
    <h3 className="text-lg font-semibold">Auth-Style Card</h3>
    <p className="text-sm text-zinc-400">
      This card uses responsive padding (p-6 on mobile, p-8 on larger screens)
    </p>
  </div>
</Card>`}
          />
        </section>

        {/* Danger Variant */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Danger Variant
          </h2>
          <p className="text-xs text-zinc-500">
            Card for error messages and alerts
          </p>
          <Card variant="danger">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Error Message</h3>
              <p className="text-sm">
                This card is used for displaying error messages, validation
                errors, or warning alerts.
              </p>
            </div>
          </Card>
          <CodeSnippet
            code={`<Card variant="danger">
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Error Message</h3>
    <p className="text-sm">
      This card is used for displaying error messages, validation
      errors, or warning alerts.
    </p>
  </div>
</Card>`}
          />
        </section>

        {/* Semantic HTML */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Semantic HTML</h2>
          <p className="text-xs text-zinc-500">
            Card with different semantic elements
          </p>
          <div className="space-y-4">
            <Card as="div" variant="primary" title="Div Element">
              <p className="text-sm text-zinc-400">Renders as &lt;div&gt;</p>
            </Card>
            <Card as="section" variant="secondary" title="Section Element">
              <p className="text-sm text-zinc-400">
                Renders as &lt;section&gt;
              </p>
            </Card>
            <Card as="article" variant="primary" title="Article Element">
              <p className="text-sm text-zinc-400">
                Renders as &lt;article&gt;
              </p>
            </Card>
          </div>
          <CodeSnippet
            code={`<Card as="div" variant="primary" title="Div Element">
  <p className="text-sm text-zinc-400">Renders as &lt;div&gt;</p>
</Card>

<Card as="section" variant="secondary" title="Section Element">
  <p className="text-sm text-zinc-400">Renders as &lt;section&gt;</p>
</Card>

<Card as="article" variant="primary" title="Article Element">
  <p className="text-sm text-zinc-400">Renders as &lt;article&gt;</p>
</Card>`}
          />
        </section>

        {/* Side by Side Comparison */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Side by Side Comparison
          </h2>
          <p className="text-xs text-zinc-500">
            New Card component vs Legacy components
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                New Card (Primary)
              </h3>
              <Card variant="primary">
                <p className="text-sm text-zinc-300">
                  New unified Card component
                </p>
              </Card>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Card (Primary with Responsive Padding)
              </h3>
              <Card variant="primary" responsivePadding>
                <p className="text-sm text-zinc-300">
                  Equivalent to legacy AuthCard: Card with
                  variant=&quot;primary&quot; and responsivePadding
                </p>
              </Card>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                New Card (Secondary)
              </h3>
              <Card variant="secondary" title="Section Title" label="Label">
                <p className="text-sm text-zinc-300">New Card with header</p>
              </Card>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Legacy TaskSectionCard
              </h3>
              <TaskSectionCard title="Section Title" eyebrow="Label">
                <p className="text-sm text-zinc-300">
                  Legacy TaskSectionCard component
                </p>
              </TaskSectionCard>
            </div>
          </div>
          <CodeSnippet
            code={`// New Card (Primary)
<Card variant="primary">
  <p className="text-sm text-zinc-300">
    New unified Card component
  </p>
</Card>

// Card (Primary with Responsive Padding) - Replaces AuthCard
<Card variant="primary" responsivePadding>
  <p className="text-sm text-zinc-300">
    Equivalent to legacy AuthCard
  </p>
</Card>

// New Card (Secondary) - Replaces TaskSectionCard
<Card variant="secondary" title="Section Title" label="Label">
  <p className="text-sm text-zinc-300">
    New Card with header
  </p>
</Card>`}
          />
        </section>

        {/* Loading States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Loading States
          </h2>
          <p className="text-xs text-zinc-500">
            Cards with loading prop - header stays visible, content shows
            spinner
          </p>
          <div className="space-y-4">
            <Card
              variant="secondary"
              title="Projects"
              label="Overview"
              action={
                <Button size="sm" variant="secondary">
                  Create Project
                </Button>
              }
              loading={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <p className="text-sm text-zinc-300">Project Card</p>
                </div>
              </div>
            </Card>
            <CodeSnippet
              code={`<Card
  variant="secondary"
  title="Projects"
  label="Overview"
  action={
    <Button size="sm" variant="secondary">
      Create Project
    </Button>
  }
  loading={true}
>
  {/* Content hidden while loading */}
</Card>`}
            />
            <Card
              variant="secondary"
              title="Task List"
              label="Overview"
              loading={true}
              loadingMessage="Loading tasks..."
            >
              <div className="space-y-2">
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <p className="text-sm text-zinc-300">Task item</p>
                </div>
              </div>
            </Card>
            <CodeSnippet
              code={`<Card
  variant="secondary"
  title="Task List"
  label="Overview"
  loading={true}
  loadingMessage="Loading tasks..."
>
  {/* Content hidden while loading */}
</Card>`}
            />
            <Card variant="primary" title="Simple Loading" loading={true}>
              <p className="text-sm text-zinc-300">
                This content is hidden while loading
              </p>
            </Card>
            <CodeSnippet
              code={`<Card variant="primary" title="Simple Loading" loading={true}>
  <p className="text-sm text-zinc-300">
    This content is hidden while loading
  </p>
</Card>`}
            />
          </div>
        </section>

        {/* Legacy Components */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Legacy Components
          </h2>
          <p className="text-xs text-zinc-500">
            Original components for reference
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Card (Primary with Responsive Padding) - Replaces AuthCard
              </h3>
              <Card variant="primary" responsivePadding>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Simple Content</h3>
                  <p className="text-sm text-zinc-400">
                    Replaces legacy AuthCard: use Card with
                    variant=&quot;primary&quot; and responsivePadding
                  </p>
                </div>
              </Card>
              <CodeSnippet
                code={`// Replaces AuthCard
<Card variant="primary" responsivePadding>
  <div className="space-y-3">
    <h3 className="text-lg font-semibold">Simple Content</h3>
    <p className="text-sm text-zinc-400">
      Replaces legacy AuthCard: use Card with
      variant="primary" and responsivePadding
    </p>
  </div>
</Card>`}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                TaskSectionCard (Legacy)
              </h3>
              <TaskSectionCard
                title="Task List"
                eyebrow="Overview"
                action={
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white"
                  >
                    Create Task
                  </button>
                }
              >
                <p className="text-sm text-zinc-400">
                  Legacy TaskSectionCard component
                </p>
              </TaskSectionCard>
              <CodeSnippet
                code={`// Legacy TaskSectionCard - Use Card instead
<TaskSectionCard
  title="Task List"
  eyebrow="Overview"
  action={<button>Create Task</button>}
>
  <p className="text-sm text-zinc-400">
    Legacy TaskSectionCard component
  </p>
</TaskSectionCard>

// Migration: Replace with Card
<Card
  variant="secondary"
  title="Task List"
  label="Overview"
  action={<Button>Create Task</Button>}
>
  <p className="text-sm text-zinc-400">
    New Card component
  </p>
</Card>`}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
