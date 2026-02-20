"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

export interface ProfilePictureCropperModalProps {
	image: string | null;
	onCropComplete: (croppedAreaPixels: Area) => void;
	onCancel: () => void;
}

export default function ProfilePictureCropperModal({
	image,
	onCropComplete,
	onCancel,
}: ProfilePictureCropperModalProps) {
	const modalId = "profile-picture-cropper";
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

	const onCropChange = (crop: Point) => {
		setCrop(crop);
	};

	const onZoomChange = (zoom: number) => {
		setZoom(zoom);
	};

	const handleCropComplete = useCallback(
		(_croppedArea: Area, croppedAreaPixels: Area) => {
			setCroppedAreaPixels(croppedAreaPixels);
		},
		[],
	);

	const handleApply = () => {
		if (croppedAreaPixels) {
			onCropComplete(croppedAreaPixels);
			Modal.Manager.close(modalId);
		}
	};

	return (
		<Modal id={modalId} size="fullscreen">
			<Modal.Header title="Crop Profile Picture" className="text-center" />
			<Modal.Body className="p-0! overflow-hidden relative flex flex-col">
				<div className="relative w-full flex-1 bg-zinc-950">
					{image && (
						<Cropper
							image={image}
							crop={crop}
							zoom={zoom}
							aspect={1}
							cropShape="round"
							showGrid={false}
							onCropChange={onCropChange}
							onCropComplete={handleCropComplete}
							onZoomChange={onZoomChange}
						/>
					)}
				</div>

				{/* Zoom Slider Overlay */}
				<div
					className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-64 px-4 py-3 bg-zinc-900/80 backdrop-blur-md rounded-full border ${StyleTheme.Divider.Subtle} z-10`}
				>
					<input
						type="range"
						value={zoom}
						min={1}
						max={3}
						step={0.1}
						aria-labelledby="Zoom"
						onChange={(e) => onZoomChange(Number(e.target.value))}
						className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
					/>
				</div>
			</Modal.Body>
			<Modal.Footer align="center" className="p-0!">
				<Container width="full" gap="none">
					<Button
						variant="secondary"
						className="flex-1 min-h-[60px] rounded-none border-none border-t border-r m-0"
						onClick={() => {
							onCancel();
							Modal.Manager.close(modalId);
						}}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						className={`flex-1 min-h-[60px] rounded-none border-none border-t ${StyleTheme.Divider.Subtle} m-0`}
						onClick={handleApply}
					>
						Apply Crop
					</Button>
				</Container>
			</Modal.Footer>
		</Modal>
	);
}
