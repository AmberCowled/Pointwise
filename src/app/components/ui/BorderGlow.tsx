"use client";

import {
	type CSSProperties,
	type PropsWithChildren,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { StyleTheme } from "./StyleTheme";

type BorderGlowProps = PropsWithChildren<{
	radius?: number;
	thickness?: number;
	blur?: number;
	brightness?: number;
	rotationsPerSecond?: number;
	gradientColors?: string[];
	includeMargins?: boolean;
	trigger?: "always" | "hover";
	top?: boolean;
	right?: boolean;
	bottom?: boolean;
	left?: boolean;
	className?: string;
	style?: CSSProperties;
}>;

const DEFAULT_COLORS = StyleTheme.BorderGlow
	.DefaultColors as unknown as string[];
const FALLBACK_RADIUS = 0;

const getChildRadius = (
	element: HTMLDivElement,
	width: number,
	height: number,
) => {
	const target = element.firstElementChild as HTMLElement | null;
	if (!target) {
		return FALLBACK_RADIUS;
	}
	const style = getComputedStyle(target);
	const rawRadius = style.borderRadius;
	if (!rawRadius) {
		return FALLBACK_RADIUS;
	}
	const [firstToken] = rawRadius.split(/\s+/);
	if (!firstToken) {
		return FALLBACK_RADIUS;
	}
	if (firstToken.endsWith("%")) {
		const percent = Number.parseFloat(firstToken);
		if (Number.isNaN(percent)) {
			return FALLBACK_RADIUS;
		}
		const base = Math.min(width, height);
		return (base * percent) / 100;
	}
	const numeric = Number.parseFloat(firstToken);
	return Number.isNaN(numeric) ? FALLBACK_RADIUS : numeric;
};

export default function BorderGlow({
	children,
	radius,
	thickness = 2,
	blur = 2,
	brightness = 3,
	rotationsPerSecond = 0.2,
	gradientColors = DEFAULT_COLORS,
	includeMargins = false,
	trigger = "always",
	top = true,
	right = true,
	bottom = true,
	left = true,
	className,
	style,
}: BorderGlowProps) {
	const id = useId();
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [gradientAngle, setGradientAngle] = useState(135);
	const [autoRadius, setAutoRadius] = useState(0);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		const element = wrapperRef.current;
		if (!element) {
			return;
		}
		const target = element.firstElementChild as HTMLElement | null;
		if (!target) {
			return;
		}

		const measure = () => {
			const wrapperRect = element.getBoundingClientRect();
			const targetRect = target.getBoundingClientRect();
			const targetStyles = getComputedStyle(target);
			const marginLeft = Number.parseFloat(targetStyles.marginLeft) || 0;
			const marginRight = Number.parseFloat(targetStyles.marginRight) || 0;
			const marginTop = Number.parseFloat(targetStyles.marginTop) || 0;
			const marginBottom = Number.parseFloat(targetStyles.marginBottom) || 0;
			const marginX = includeMargins ? marginLeft + marginRight : 0;
			const marginY = includeMargins ? marginTop + marginBottom : 0;

			const width = targetRect.width + marginX;
			const height = targetRect.height + marginY;
			const x =
				targetRect.left - wrapperRect.left - (includeMargins ? marginLeft : 0);
			const y =
				targetRect.top - wrapperRect.top - (includeMargins ? marginTop : 0);

			setSize({ width, height });
			setOffset({ x, y });
			if (radius === undefined) {
				setAutoRadius(getChildRadius(element, width, height));
			}
		};

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) {
				return;
			}
			void entry;
			measure();
		});

		observer.observe(target);
		measure();
		return () => observer.disconnect();
	}, [radius, includeMargins]);

	useEffect(() => {
		if (radius !== undefined) {
			return;
		}
		const element = wrapperRef.current;
		if (!element) {
			return;
		}
		setAutoRadius(getChildRadius(element, size.width, size.height));
	}, [radius, size.height, size.width]);

	useEffect(() => {
		let frame = 0;
		let lastTime = performance.now();

		const tick = (now: number) => {
			const deltaSeconds = (now - lastTime) / 1000;
			lastTime = now;
			setGradientAngle(
				(prev) => (prev + 360 * rotationsPerSecond * deltaSeconds) % 360,
			);
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [rotationsPerSecond]);

	const gradientStops = useMemo(() => {
		const colors = gradientColors.length >= 2 ? gradientColors : DEFAULT_COLORS;
		const step = 100 / (colors.length - 1);
		return colors.map((color, index) => ({
			color,
			offset: `${step * index}%`,
		}));
	}, [gradientColors]);

	const filterPadding = blur * 6;
	const strokeWidth = Math.max(0.5, thickness);
	const rectRadius = Math.max(0, radius ?? autoRadius);
	const maskThickness = strokeWidth + blur * 4;
	const activeSides = [top, right, bottom, left].filter(Boolean).length;

	return (
		<div
			aria-hidden="true"
			ref={wrapperRef}
			className={`relative w-full ${className ?? ""}`}
			style={style}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{children}
			{size.width > 0 &&
				size.height > 0 &&
				(trigger === "always" || (trigger === "hover" && isHovered)) && (
					<svg
						aria-hidden="true"
						width={size.width}
						height={size.height}
						viewBox={`0 0 ${size.width} ${size.height}`}
						className="absolute pointer-events-none"
						style={{ overflow: "visible", left: offset.x, top: offset.y }}
					>
						<defs>
							<mask id={`borderGlowMask-${id}`}>
								<rect width={size.width} height={size.height} fill="black" />
								{top && (
									<rect
										width={size.width}
										height={maskThickness}
										y={0}
										fill="white"
									/>
								)}
								{bottom && (
									<rect
										width={size.width}
										height={maskThickness}
										y={Math.max(0, size.height - maskThickness)}
										fill="white"
									/>
								)}
								{left && (
									<rect
										width={maskThickness}
										height={size.height}
										x={0}
										fill="white"
									/>
								)}
								{right && (
									<rect
										width={maskThickness}
										height={size.height}
										x={Math.max(0, size.width - maskThickness)}
										fill="white"
									/>
								)}
							</mask>
							<linearGradient
								id={`borderGlowGradient-${id}`}
								gradientUnits="userSpaceOnUse"
								gradientTransform={`rotate(${gradientAngle} ${size.width / 2} ${
									size.height / 2
								})`}
							>
								{gradientStops.map((stop) => (
									<stop
										key={stop.offset}
										offset={stop.offset}
										stopColor={stop.color}
									/>
								))}
							</linearGradient>
							<filter
								id={`borderGlowBlur-${id}`}
								x={-filterPadding}
								y={-filterPadding}
								width={size.width + filterPadding * 2}
								height={size.height + filterPadding * 2}
								filterUnits="userSpaceOnUse"
							>
								<feGaussianBlur stdDeviation={blur} />
								<feComponentTransfer>
									<feFuncR type="linear" slope={brightness} />
									<feFuncG type="linear" slope={brightness} />
									<feFuncB type="linear" slope={brightness} />
								</feComponentTransfer>
							</filter>
						</defs>
						{activeSides === 1 ? (
							<>
								{top && (
									<line
										x1={strokeWidth / 2}
										y1={strokeWidth / 2}
										x2={size.width - strokeWidth / 2}
										y2={strokeWidth / 2}
										stroke={`url(#borderGlowGradient-${id})`}
										strokeWidth={strokeWidth}
										filter={`url(#borderGlowBlur-${id})`}
										opacity="0.7"
									/>
								)}
								{bottom && (
									<line
										x1={strokeWidth / 2}
										y1={size.height - strokeWidth / 2}
										x2={size.width - strokeWidth / 2}
										y2={size.height - strokeWidth / 2}
										stroke={`url(#borderGlowGradient-${id})`}
										strokeWidth={strokeWidth}
										filter={`url(#borderGlowBlur-${id})`}
										opacity="0.7"
									/>
								)}
								{left && (
									<line
										x1={strokeWidth / 2}
										y1={strokeWidth / 2}
										x2={strokeWidth / 2}
										y2={size.height - strokeWidth / 2}
										stroke={`url(#borderGlowGradient-${id})`}
										strokeWidth={strokeWidth}
										filter={`url(#borderGlowBlur-${id})`}
										opacity="0.7"
									/>
								)}
								{right && (
									<line
										x1={size.width - strokeWidth / 2}
										y1={strokeWidth / 2}
										x2={size.width - strokeWidth / 2}
										y2={size.height - strokeWidth / 2}
										stroke={`url(#borderGlowGradient-${id})`}
										strokeWidth={strokeWidth}
										filter={`url(#borderGlowBlur-${id})`}
										opacity="0.7"
									/>
								)}
								{top && (
									<line
										x1={strokeWidth / 2}
										y1={strokeWidth / 2}
										x2={size.width - strokeWidth / 2}
										y2={strokeWidth / 2}
										stroke={`url(#borderGlowGradient-${id})`}
										strokeWidth={strokeWidth}
									/>
								)}
								{bottom && (
									<line
										x1={strokeWidth / 2}
										y1={size.height - strokeWidth / 2}
										x2={size.width - strokeWidth / 2}
										y2={size.height - strokeWidth / 2}
										stroke={`url(#borderGlowGradient-${id})`}
										strokeWidth={strokeWidth}
									/>
								)}
								{left && (
									<line
										x1={strokeWidth / 2}
										y1={strokeWidth / 2}
										x2={strokeWidth / 2}
										y2={size.height - strokeWidth / 2}
										stroke={`url(#borderGlowGradient-${id})`}
										strokeWidth={strokeWidth}
									/>
								)}
								{right && (
									<line
										x1={size.width - strokeWidth / 2}
										y1={strokeWidth / 2}
										x2={size.width - strokeWidth / 2}
										y2={size.height - strokeWidth / 2}
										stroke={`url(#borderGlowGradient-${id})`}
										strokeWidth={strokeWidth}
									/>
								)}
							</>
						) : (
							<g mask={`url(#borderGlowMask-${id})`}>
								<rect
									x={strokeWidth / 2}
									y={strokeWidth / 2}
									width={size.width - strokeWidth}
									height={size.height - strokeWidth}
									rx={Math.min(rectRadius, size.width / 2)}
									ry={Math.min(rectRadius, size.height / 2)}
									fill="none"
									stroke={`url(#borderGlowGradient-${id})`}
									strokeWidth={strokeWidth}
									filter={`url(#borderGlowBlur-${id})`}
									opacity="0.7"
								/>
								<rect
									x={strokeWidth / 2}
									y={strokeWidth / 2}
									width={size.width - strokeWidth}
									height={size.height - strokeWidth}
									rx={Math.min(rectRadius, size.width / 2)}
									ry={Math.min(rectRadius, size.height / 2)}
									fill="none"
									stroke={`url(#borderGlowGradient-${id})`}
									strokeWidth={strokeWidth}
								/>
							</g>
						)}
					</svg>
				)}
		</div>
	);
}
