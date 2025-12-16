"use client";

import BackgroundGlow from "@pointwise/app/components/general/BackgroundGlow";
import { Button } from "@pointwise/app/components/ui/Button";
import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	ModalHeader,
	XIcon,
} from "@pointwise/app/components/ui/modals";
import { useState } from "react";

export default function ModalShowcasePage() {
	const [standardModalOpen, setStandardModalOpen] = useState(false);
	const [fullScreenModalOpen, setFullScreenModalOpen] = useState(false);
	const [sizedModals, setSizedModals] = useState({
		sm: false,
		md: false,
		lg: false,
		xl: false,
	});
	const [animationModal, setAnimationModal] = useState<{
		type: "fade" | "slide" | "scale" | "none";
		open: boolean;
	}>({ type: "fade", open: false });
	const [loadingModalOpen, setLoadingModalOpen] = useState(false);
	const [iconModalOpen, setIconModalOpen] = useState(false);
	const [headerSizeModal, setHeaderSizeModal] = useState<{
		size: "sm" | "md" | "lg";
		open: boolean;
	}>({ size: "md", open: false });
	const [scrollModalOpen, setScrollModalOpen] = useState(false);
	const [paddingModalOpen, setPaddingModalOpen] = useState(false);
	const [footerSizeModal, setFooterSizeModal] = useState<{
		size: "sm" | "md" | "lg";
		open: boolean;
	}>({ size: "md", open: false });
	const [closeVariantModal, setCloseVariantModal] = useState<{
		variant: "primary" | "secondary" | "ghost";
		open: boolean;
	}>({ variant: "secondary", open: false });
	const [closeBehaviorModal, setCloseBehaviorModal] = useState({
		overlayClick: false,
		escape: false,
	});
	const [eventCallbackModalOpen, setEventCallbackModalOpen] = useState(false);
	const [eventLog, setEventLog] = useState<string[]>([]);
	const [nestedModal, setNestedModal] = useState({
		outer: false,
		inner: false,
	});

	const addEventLog = (message: string) => {
		setEventLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
	};

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
					<h2 className="text-xl font-semibold text-zinc-200">Standard Modal</h2>
					<p className="text-xs text-zinc-500">
						Centered modal with different sizes (sm, md, lg, xl)
					</p>
					<Button variant="primary" size="md" onClick={() => setStandardModalOpen(true)}>
						Open Standard Modal
					</Button>

					<Modal open={standardModalOpen} onClose={() => setStandardModalOpen(false)} size="md">
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
								The modal is centered on the screen and has a backdrop overlay. Notice that body
								scrolling is locked when this modal is open.
							</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button variant="secondary" size="md" onClick={() => setStandardModalOpen(false)}>
								Cancel
							</Button>
							<Button variant="primary" size="md" onClick={() => setStandardModalOpen(false)}>
								Confirm
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Animation Presets */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Animation Presets</h2>
					<p className="text-xs text-zinc-500">
						Different animation styles: fade, slide, scale, none
					</p>
					<div className="flex flex-wrap gap-3">
						{(["fade", "slide", "scale", "none"] as const).map((anim) => (
							<Button
								key={anim}
								variant="primary"
								size="sm"
								onClick={() => setAnimationModal({ type: anim, open: true })}
							>
								{anim.charAt(0).toUpperCase() + anim.slice(1)}
							</Button>
						))}
					</div>

					<Modal
						open={animationModal.open}
						onClose={() => setAnimationModal({ ...animationModal, open: false })}
						size="md"
						animation={animationModal.type}
					>
						<ModalHeader
							title={`${animationModal.type.charAt(0).toUpperCase() + animationModal.type.slice(1)} Animation`}
							subtitle={`This modal uses the "${animationModal.type}" animation preset`}
							showCloseButton
							onClose={() => setAnimationModal({ ...animationModal, open: false })}
						/>
						<ModalBody>
							<p className="text-zinc-300">
								Watch the animation when this modal opens and closes. The{" "}
								<code className="text-indigo-400">{animationModal.type}</code> animation is applied
								to the panel.
							</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button
								variant="primary"
								size="md"
								onClick={() => setAnimationModal({ ...animationModal, open: false })}
							>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Loading State */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Loading State</h2>
					<p className="text-xs text-zinc-500">Modal with loading overlay and custom message</p>
					<Button variant="primary" size="md" onClick={() => setLoadingModalOpen(true)}>
						Open Loading Modal
					</Button>

					<Modal
						open={loadingModalOpen}
						onClose={() => setLoadingModalOpen(false)}
						size="md"
						loading={loadingModalOpen}
						loadingMessage="Processing your request..."
					>
						<ModalHeader
							title="Loading Modal"
							subtitle="This modal shows a loading state"
							showCloseButton
							onClose={() => setLoadingModalOpen(false)}
						/>
						<ModalBody>
							<p className="text-zinc-300">
								This modal demonstrates the loading overlay feature. The loading overlay appears
								above the modal content with a spinner and custom message.
							</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button variant="primary" size="md" onClick={() => setLoadingModalOpen(false)}>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Icon Support in Header */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Icon Support in Header</h2>
					<p className="text-xs text-zinc-500">
						ModalHeader with icon support (left or right position)
					</p>
					<div className="flex flex-wrap gap-3">
						<Button variant="primary" size="sm" onClick={() => setIconModalOpen(true)}>
							Open Modal with Icon
						</Button>
					</div>

					<Modal open={iconModalOpen} onClose={() => setIconModalOpen(false)} size="md">
						<ModalHeader
							title="Modal with Icon"
							subtitle="Icons can be positioned left or right of the title"
							icon={
								<div className="rounded-full bg-indigo-500/20 p-2">
									<svg
										className="h-5 w-5 text-indigo-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
							}
							iconPosition="left"
							showCloseButton
							onClose={() => setIconModalOpen(false)}
						/>
						<ModalBody>
							<p className="text-zinc-300">
								This modal header includes an icon positioned to the left of the title. You can also
								position icons to the right.
							</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button variant="primary" size="md" onClick={() => setIconModalOpen(false)}>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Header Size Variants */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Header Size Variants</h2>
					<p className="text-xs text-zinc-500">
						Different size variants for ModalHeader: sm, md, lg
					</p>
					<div className="flex flex-wrap gap-3">
						{(["sm", "md", "lg"] as const).map((size) => (
							<Button
								key={size}
								variant="primary"
								size="sm"
								onClick={() => setHeaderSizeModal({ size, open: true })}
							>
								Size: {size}
							</Button>
						))}
					</div>

					<Modal
						open={headerSizeModal.open}
						onClose={() => setHeaderSizeModal({ ...headerSizeModal, open: false })}
						size="md"
					>
						<ModalHeader
							title={`Header Size: ${headerSizeModal.size}`}
							subtitle={`This header uses the "${headerSizeModal.size}" size variant`}
							size={headerSizeModal.size}
							showCloseButton
							onClose={() => setHeaderSizeModal({ ...headerSizeModal, open: false })}
						/>
						<ModalBody>
							<p className="text-zinc-300">
								Notice how the title and subtitle font sizes change based on the size prop.
							</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button
								variant="primary"
								size="md"
								onClick={() => setHeaderSizeModal({ ...headerSizeModal, open: false })}
							>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Scroll Behavior Options */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Scroll Behavior Options</h2>
					<p className="text-xs text-zinc-500">
						ModalBody with scroll control: maxHeight, scrollBehavior, noScroll
					</p>
					<Button variant="primary" size="md" onClick={() => setScrollModalOpen(true)}>
						Open Scrollable Modal
					</Button>

					<Modal open={scrollModalOpen} onClose={() => setScrollModalOpen(false)} size="md">
						<ModalHeader
							title="Scrollable Modal"
							subtitle="This modal body has scroll behavior options"
							showCloseButton
							onClose={() => setScrollModalOpen(false)}
						/>
						<ModalBody maxHeight="300px" scrollBehavior="smooth" padding="md">
							<div className="space-y-4">
								{Array.from({ length: 20 }, (_, i) => (
									<p key={i} className="text-zinc-300">
										This is paragraph {i + 1}. Scroll down to see more content. The modal body has a
										max height of 300px with smooth scrolling enabled.
									</p>
								))}
							</div>
						</ModalBody>
						<ModalFooter align="end">
							<Button variant="primary" size="md" onClick={() => setScrollModalOpen(false)}>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Padding Variants */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Padding Variants</h2>
					<p className="text-xs text-zinc-500">
						ModalBody with different padding options: none, sm, md, lg
					</p>
					<Button variant="primary" size="md" onClick={() => setPaddingModalOpen(true)}>
						Open Modal with Padding Variants
					</Button>

					<Modal open={paddingModalOpen} onClose={() => setPaddingModalOpen(false)} size="md">
						<ModalHeader
							title="Padding Variants"
							subtitle="This modal demonstrates different padding options"
							showCloseButton
							onClose={() => setPaddingModalOpen(false)}
						/>
						<ModalBody padding="lg">
							<div className="space-y-4">
								<div className="border border-white/10 rounded-lg p-4 bg-white/5">
									<p className="text-sm font-medium text-zinc-300 mb-2">Large Padding (lg)</p>
									<p className="text-xs text-zinc-400">
										This section uses padding=&quot;lg&quot; for more spacious content.
									</p>
								</div>
								<div className="border border-white/10 rounded-lg p-4 bg-white/5">
									<p className="text-sm font-medium text-zinc-300 mb-2">Other Options</p>
									<p className="text-xs text-zinc-400">
										You can also use padding=&quot;none&quot;, padding=&quot;sm&quot;, or
										padding=&quot;md&quot;.
									</p>
								</div>
							</div>
						</ModalBody>
						<ModalFooter align="end">
							<Button variant="primary" size="md" onClick={() => setPaddingModalOpen(false)}>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Footer Size Variants */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Footer Size Variants</h2>
					<p className="text-xs text-zinc-500">
						Different size variants for ModalFooter: sm, md, lg
					</p>
					<div className="flex flex-wrap gap-3">
						{(["sm", "md", "lg"] as const).map((size) => (
							<Button
								key={size}
								variant="primary"
								size="sm"
								onClick={() => setFooterSizeModal({ size, open: true })}
							>
								Size: {size}
							</Button>
						))}
					</div>

					<Modal
						open={footerSizeModal.open}
						onClose={() => setFooterSizeModal({ ...footerSizeModal, open: false })}
						size="md"
					>
						<ModalHeader
							title="Footer Size Variants"
							subtitle={`This footer uses the "${footerSizeModal.size}" size variant`}
							showCloseButton
							onClose={() => setFooterSizeModal({ ...footerSizeModal, open: false })}
						/>
						<ModalBody>
							<p className="text-zinc-300">
								Notice how the footer padding and gap spacing change based on the size prop.
							</p>
						</ModalBody>
						<ModalFooter align="end" size={footerSizeModal.size}>
							<Button
								variant="secondary"
								size="md"
								onClick={() => setFooterSizeModal({ ...footerSizeModal, open: false })}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={() => setFooterSizeModal({ ...footerSizeModal, open: false })}
							>
								Confirm
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Close Button Variants */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Close Button Variants</h2>
					<p className="text-xs text-zinc-500">
						ModalCloseButton with different variants: primary, secondary, ghost
					</p>
					<div className="flex flex-wrap gap-3">
						{(["primary", "secondary", "ghost"] as const).map((variant) => (
							<Button
								key={variant}
								variant="primary"
								size="sm"
								onClick={() => setCloseVariantModal({ variant, open: true })}
							>
								Variant: {variant}
							</Button>
						))}
					</div>

					<Modal
						open={closeVariantModal.open}
						onClose={() => setCloseVariantModal({ ...closeVariantModal, open: false })}
						size="md"
					>
						<ModalHeader
							title="Close Button Variants"
							subtitle={`Close button uses "${closeVariantModal.variant}" variant`}
							showCloseButton
							onClose={() => setCloseVariantModal({ ...closeVariantModal, open: false })}
						/>
						<ModalBody>
							<div className="space-y-4">
								<p className="text-zinc-300">
									The close button in the header uses the{" "}
									<code className="text-indigo-400">{closeVariantModal.variant}</code> variant. You
									can also use ModalCloseButton standalone:
								</p>
								<div className="flex gap-3">
									<ModalCloseButton onClose={() => {}} variant="primary" size="md" />
									<ModalCloseButton onClose={() => {}} variant="secondary" size="md" />
									<ModalCloseButton onClose={() => {}} variant="ghost" size="md" />
								</div>
							</div>
						</ModalBody>
						<ModalFooter align="end">
							<Button
								variant="primary"
								size="md"
								onClick={() => setCloseVariantModal({ ...closeVariantModal, open: false })}
							>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Close Behavior Control */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Close Behavior Control</h2>
					<p className="text-xs text-zinc-500">
						Control whether modal closes on overlay click or Escape key
					</p>
					<div className="flex flex-wrap gap-3">
						<Button
							variant="primary"
							size="sm"
							onClick={() => setCloseBehaviorModal({ overlayClick: true, escape: true })}
						>
							Both Enabled (Default)
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={() => setCloseBehaviorModal({ overlayClick: false, escape: true })}
						>
							Overlay Disabled
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={() => setCloseBehaviorModal({ overlayClick: true, escape: false })}
						>
							Escape Disabled
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={() => setCloseBehaviorModal({ overlayClick: false, escape: false })}
						>
							Both Disabled
						</Button>
					</div>

					<Modal
						open={closeBehaviorModal.overlayClick || closeBehaviorModal.escape}
						onClose={() => setCloseBehaviorModal({ overlayClick: false, escape: false })}
						size="md"
						closeOnOverlayClick={closeBehaviorModal.overlayClick}
						closeOnEscape={closeBehaviorModal.escape}
					>
						<ModalHeader
							title="Close Behavior Control"
							subtitle={`Overlay: ${closeBehaviorModal.overlayClick ? "enabled" : "disabled"}, Escape: ${closeBehaviorModal.escape ? "enabled" : "disabled"}`}
							showCloseButton
							onClose={() => setCloseBehaviorModal({ overlayClick: false, escape: false })}
						/>
						<ModalBody>
							<p className="text-zinc-300">
								Try clicking the overlay or pressing Escape. The behavior is controlled by the{" "}
								<code className="text-indigo-400">closeOnOverlayClick</code> and{" "}
								<code className="text-indigo-400">closeOnEscape</code> props.
							</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button
								variant="primary"
								size="md"
								onClick={() => setCloseBehaviorModal({ overlayClick: false, escape: false })}
							>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Event Callbacks */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Event Callbacks</h2>
					<p className="text-xs text-zinc-500">
						onOpen and onAfterClose callbacks for lifecycle events
					</p>
					<Button
						variant="primary"
						size="md"
						onClick={() => {
							setEventLog([]);
							setEventCallbackModalOpen(true);
						}}
					>
						Open Modal with Event Callbacks
					</Button>

					<Modal
						open={eventCallbackModalOpen}
						onClose={() => setEventCallbackModalOpen(false)}
						size="md"
						onOpen={() => addEventLog("Modal opened")}
						onAfterClose={() => addEventLog("Modal closed (after transition)")}
					>
						<ModalHeader
							title="Event Callbacks"
							subtitle="Check the event log below"
							showCloseButton
							onClose={() => setEventCallbackModalOpen(false)}
						/>
						<ModalBody>
							<p className="text-zinc-300 mb-4">
								This modal uses <code className="text-indigo-400">onOpen</code> and{" "}
								<code className="text-indigo-400">onAfterClose</code> callbacks. Open and close this
								modal to see the events logged below.
							</p>
							{eventLog.length > 0 && (
								<div className="border border-white/10 rounded-lg p-4 bg-white/5">
									<h3 className="text-sm font-medium text-zinc-300 mb-2">Event Log:</h3>
									<div className="space-y-1">
										{eventLog.map((log, i) => (
											<p key={i} className="text-xs text-zinc-400 font-mono">
												{log}
											</p>
										))}
									</div>
								</div>
							)}
						</ModalBody>
						<ModalFooter align="end">
							<Button variant="primary" size="md" onClick={() => setEventCallbackModalOpen(false)}>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Nested Modals */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Nested Modals</h2>
					<p className="text-xs text-zinc-500">
						Support for nested modals with automatic z-index management
					</p>
					<Button
						variant="primary"
						size="md"
						onClick={() => setNestedModal({ outer: true, inner: false })}
					>
						Open Nested Modal Demo
					</Button>

					{/* Outer Modal */}
					<Modal
						open={nestedModal.outer}
						onClose={() => setNestedModal({ outer: false, inner: false })}
						size="md"
						zIndex={50}
					>
						<ModalHeader
							title="Outer Modal"
							subtitle="This is the first modal (z-index: 50)"
							showCloseButton
							onClose={() => setNestedModal({ outer: false, inner: false })}
						/>
						<ModalBody>
							<p className="text-zinc-300 mb-4">
								This is the outer modal. Click the button below to open a nested modal inside it.
							</p>
							<Button
								variant="primary"
								size="sm"
								onClick={() => setNestedModal({ outer: true, inner: true })}
							>
								Open Nested Modal
							</Button>
						</ModalBody>
						<ModalFooter align="end">
							<Button
								variant="primary"
								size="md"
								onClick={() => setNestedModal({ outer: false, inner: false })}
							>
								Close
							</Button>
						</ModalFooter>
					</Modal>

					{/* Inner Modal */}
					<Modal
						open={nestedModal.inner}
						onClose={() => setNestedModal({ outer: true, inner: false })}
						size="sm"
						zIndex={50}
					>
						<ModalHeader
							title="Nested Modal"
							subtitle="This modal is nested (z-index: 60, auto-calculated)"
							showCloseButton
							onClose={() => setNestedModal({ outer: true, inner: false })}
						/>
						<ModalBody>
							<p className="text-zinc-300">
								This is a nested modal. Notice how it appears above the outer modal. The z-index is
								automatically calculated based on nesting depth (each level adds 10).
							</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button
								variant="primary"
								size="md"
								onClick={() => setNestedModal({ outer: true, inner: false })}
							>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Modal Sizes */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Modal Sizes</h2>
					<p className="text-xs text-zinc-500">Different size variants: sm, md, lg, xl</p>
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
								onClick={() => setSizedModals((prev) => ({ ...prev, sm: false }))}
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
								onClick={() => setSizedModals((prev) => ({ ...prev, md: false }))}
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
							<p className="text-zinc-300">This is a large modal with more space.</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button
								variant="primary"
								size="md"
								onClick={() => setSizedModals((prev) => ({ ...prev, lg: false }))}
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
							<p className="text-zinc-300">This is an extra large modal with maximum width.</p>
						</ModalBody>
						<ModalFooter align="end">
							<Button
								variant="primary"
								size="md"
								onClick={() => setSizedModals((prev) => ({ ...prev, xl: false }))}
							>
								Close
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Full Screen Modal */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Full Screen Modal</h2>
					<p className="text-xs text-zinc-500">
						Modal that takes up the entire screen (used in TaskCreateModal, TaskManageModal)
					</p>
					<Button variant="primary" size="md" onClick={() => setFullScreenModalOpen(true)}>
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
									This is a full screen modal. It&apos;s useful for complex forms or detailed views.
								</p>
								<p className="text-zinc-400">
									The TaskCreateModal and TaskManageModal components use this type of modal.
								</p>
							</div>
						</ModalBody>
						<ModalFooter align="end">
							<Button variant="secondary" size="md" onClick={() => setFullScreenModalOpen(false)}>
								Cancel
							</Button>
							<Button variant="primary" size="md" onClick={() => setFullScreenModalOpen(false)}>
								Save
							</Button>
						</ModalFooter>
					</Modal>
				</section>

				{/* Footer Alignment */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Footer Alignment Options</h2>
					<p className="text-xs text-zinc-500">
						Different alignment options for modal footer: start, center, end, between
					</p>
					<div className="space-y-6">
						{(["start", "center", "end", "between"] as const).map((align) => (
							<div key={align} className="space-y-2">
								<h3 className="text-sm font-medium text-zinc-400">Align: {align}</h3>
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

				{/* XIcon Component */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">XIcon Component</h2>
					<p className="text-xs text-zinc-500">Reusable X icon component with size variants</p>
					<div className="border border-white/10 rounded-lg p-6 bg-white/5">
						<div className="flex items-center gap-4">
							{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
								<div key={size} className="flex flex-col items-center gap-2">
									<XIcon size={size} className="text-zinc-400" />
									<span className="text-xs text-zinc-500">{size}</span>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Usage Examples */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Usage Examples</h2>
					<div className="space-y-4">
						<div className="border border-white/10 rounded-lg p-4 bg-white/5">
							<h3 className="text-sm font-medium text-zinc-300 mb-2">Basic Modal</h3>
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
							<h3 className="text-sm font-medium text-zinc-300 mb-2">Modal with All Features</h3>
							<pre className="text-xs text-zinc-400 overflow-x-auto">
								<code>{`<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  size="lg"
  animation="slide"
  loading={isLoading}
  loadingMessage="Loading..."
  closeOnOverlayClick={true}
  closeOnEscape={true}
  onOpen={() => console.log('Opened')}
  onAfterClose={() => console.log('Closed')}
  zIndex={50}
>
  <ModalHeader
    title="Title"
    subtitle="Subtitle"
    icon={<Icon />}
    iconPosition="left"
    size="lg"
    showCloseButton
  />
  <ModalBody
    padding="lg"
    maxHeight="400px"
    scrollBehavior="smooth"
  >
    Content
  </ModalBody>
  <ModalFooter align="between" size="lg">
    <Button>Cancel</Button>
    <Button>Confirm</Button>
  </ModalFooter>
</Modal>`}</code>
							</pre>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
