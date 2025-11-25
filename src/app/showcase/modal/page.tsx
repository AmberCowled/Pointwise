'use client';

import { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@pointwise/app/components/ui/modals';
import { Button } from '@pointwise/app/components/ui/Button';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';

export default function ModalShowcasePage() {
  const [standardModalOpen, setStandardModalOpen] = useState(false);
  const [fullScreenModalOpen, setFullScreenModalOpen] = useState(false);
  const [sizedModals, setSizedModals] = useState({
    sm: false,
    md: false,
    lg: false,
    xl: false,
  });
  const [closeButtonModalOpen, setCloseButtonModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Modal Showcase</h1>
          <p className="text-sm text-zinc-400">
            Comprehensive display of all modal variants, sizes, and features
          </p>
        </div>

        {/* Standard Modal */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Standard Modal
          </h2>
          <p className="text-xs text-zinc-500">
            Centered modal with different sizes (sm, md, lg, xl)
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setStandardModalOpen(true)}
          >
            Open Standard Modal
          </Button>

          <Modal
            open={standardModalOpen}
            onClose={() => setStandardModalOpen(false)}
            size="md"
          >
            <ModalHeader
              title="Standard Modal"
              subtitle="This is a centered modal dialog"
              showCloseButton
              onClose={() => setStandardModalOpen(false)}
            />
            <ModalBody>
              <p className="text-zinc-300">
                This is the body of the modal. You can put any content here.
              </p>
              <p className="text-zinc-400 mt-4">
                The modal is centered on the screen and has a backdrop overlay.
              </p>
            </ModalBody>
            <ModalFooter align="end">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStandardModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStandardModalOpen(false)}
              >
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Modal Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Modal Sizes</h2>
          <p className="text-xs text-zinc-500">
            Different size variants: sm, md, lg, xl
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSizedModals((prev) => ({ ...prev, sm: true }))}
            >
              Small (sm)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSizedModals((prev) => ({ ...prev, md: true }))}
            >
              Medium (md)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSizedModals((prev) => ({ ...prev, lg: true }))}
            >
              Large (lg)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSizedModals((prev) => ({ ...prev, xl: true }))}
            >
              Extra Large (xl)
            </Button>
          </div>

          {/* Small Modal */}
          <Modal
            open={sizedModals.sm}
            onClose={() => setSizedModals((prev) => ({ ...prev, sm: false }))}
            size="sm"
          >
            <ModalHeader
              title="Small Modal"
              showCloseButton
              onClose={() => setSizedModals((prev) => ({ ...prev, sm: false }))}
            />
            <ModalBody>
              <p className="text-zinc-300">This is a small modal.</p>
            </ModalBody>
            <ModalFooter align="end">
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setSizedModals((prev) => ({ ...prev, sm: false }))
                }
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>

          {/* Medium Modal */}
          <Modal
            open={sizedModals.md}
            onClose={() => setSizedModals((prev) => ({ ...prev, md: false }))}
            size="md"
          >
            <ModalHeader
              title="Medium Modal"
              showCloseButton
              onClose={() => setSizedModals((prev) => ({ ...prev, md: false }))}
            />
            <ModalBody>
              <p className="text-zinc-300">This is a medium-sized modal.</p>
            </ModalBody>
            <ModalFooter align="end">
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  setSizedModals((prev) => ({ ...prev, md: false }))
                }
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>

          {/* Large Modal */}
          <Modal
            open={sizedModals.lg}
            onClose={() => setSizedModals((prev) => ({ ...prev, lg: false }))}
            size="lg"
          >
            <ModalHeader
              title="Large Modal"
              showCloseButton
              onClose={() => setSizedModals((prev) => ({ ...prev, lg: false }))}
            />
            <ModalBody>
              <p className="text-zinc-300">
                This is a large modal with more space.
              </p>
            </ModalBody>
            <ModalFooter align="end">
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  setSizedModals((prev) => ({ ...prev, lg: false }))
                }
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>

          {/* Extra Large Modal */}
          <Modal
            open={sizedModals.xl}
            onClose={() => setSizedModals((prev) => ({ ...prev, xl: false }))}
            size="xl"
          >
            <ModalHeader
              title="Extra Large Modal"
              showCloseButton
              onClose={() => setSizedModals((prev) => ({ ...prev, xl: false }))}
            />
            <ModalBody>
              <p className="text-zinc-300">
                This is an extra large modal with maximum width.
              </p>
            </ModalBody>
            <ModalFooter align="end">
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  setSizedModals((prev) => ({ ...prev, xl: false }))
                }
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Full Screen Modal */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Full Screen Modal
          </h2>
          <p className="text-xs text-zinc-500">
            Modal that takes up the entire screen (used in TaskCreateModal,
            TaskManageModal)
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setFullScreenModalOpen(true)}
          >
            Open Full Screen Modal
          </Button>

          <Modal
            open={fullScreenModalOpen}
            onClose={() => setFullScreenModalOpen(false)}
            size="fullscreen"
          >
            <ModalHeader
              title="Full Screen Modal"
              subtitle="This modal takes up the entire screen"
              showCloseButton
              onClose={() => setFullScreenModalOpen(false)}
            />
            <ModalBody>
              <div className="space-y-4">
                <p className="text-zinc-300">
                  This is a full screen modal. It&apos;s useful for complex
                  forms or detailed views.
                </p>
                <p className="text-zinc-400">
                  The TaskCreateModal and TaskManageModal components use this
                  type of modal.
                </p>
              </div>
            </ModalBody>
            <ModalFooter align="end">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setFullScreenModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setFullScreenModalOpen(false)}
              >
                Save
              </Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Modal Close Button */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Modal Close Button
          </h2>
          <p className="text-xs text-zinc-500">
            Reusable close button component with different sizes
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setCloseButtonModalOpen(true)}
          >
            Open Modal with Close Button
          </Button>

          <Modal
            open={closeButtonModalOpen}
            onClose={() => setCloseButtonModalOpen(false)}
            size="md"
          >
            <ModalHeader
              title="Modal with Close Button"
              subtitle="The close button is integrated into the header"
              showCloseButton
              onClose={() => setCloseButtonModalOpen(false)}
            />
            <ModalBody>
              <p className="text-zinc-300">
                This modal demonstrates the ModalCloseButton component
                integrated into the header.
              </p>
            </ModalBody>
            <ModalFooter align="end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setCloseButtonModalOpen(false)}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Footer Alignment */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Footer Alignment Options
          </h2>
          <p className="text-xs text-zinc-500">
            Different alignment options for modal footer: start, center, end,
            between
          </p>
          <div className="space-y-6">
            {(['start', 'center', 'end', 'between'] as const).map((align) => (
              <div key={align} className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400">
                  Align: {align}
                </h3>
                <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <ModalFooter align={align}>
                    <Button variant="secondary" size="sm">
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm">
                      Confirm
                    </Button>
                  </ModalFooter>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal Header Variations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Modal Header Variations
          </h2>
          <p className="text-xs text-zinc-500">
            Different header configurations: with/without title, subtitle,
            actions. Note: ModalHeader must be used inside a Modal component.
          </p>
          <div className="space-y-4">
            <div className="border border-white/10 rounded-lg p-6 bg-white/5">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">
                Header Examples (inside modals above)
              </h3>
              <p className="text-xs text-zinc-500">
                See the modals above for examples of ModalHeader with different
                configurations. ModalHeader uses DialogTitle which requires a
                parent Dialog component.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Usage Examples
          </h2>
          <div className="space-y-4">
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <h3 className="text-sm font-medium text-zinc-300 mb-2">
                Basic Modal
              </h3>
              <pre className="text-xs text-zinc-400 overflow-x-auto">
                <code>{`<Modal open={isOpen} onClose={() => setIsOpen(false)} size="md">
  <ModalHeader title="Example" showCloseButton onClose={() => setIsOpen(false)} />
  <ModalBody>Content</ModalBody>
  <ModalFooter align="end">
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </ModalFooter>
</Modal>`}</code>
              </pre>
            </div>
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <h3 className="text-sm font-medium text-zinc-300 mb-2">
                Full Screen Modal
              </h3>
              <pre className="text-xs text-zinc-400 overflow-x-auto">
                <code>{`<Modal open={isOpen} onClose={() => setIsOpen(false)} size="fullscreen">
  <ModalHeader title="Full Screen" />
  <ModalBody>Content</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
