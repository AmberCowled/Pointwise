"use client";

import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import clsx from "clsx";
import { useState } from "react";

export interface RoleSelectorProps {
	onRoleChange: (role: "ADMIN" | "USER" | "VIEWER") => void;
	defaultValue?: "ADMIN" | "USER" | "VIEWER";
	disabled?: boolean;
}

const roleStyles: Record<"ADMIN" | "USER" | "VIEWER", string> = {
	ADMIN: "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30",
	USER: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
	VIEWER: "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30",
};

const roleLabels: Record<"ADMIN" | "USER" | "VIEWER", string> = {
	ADMIN: "Admin",
	USER: "User",
	VIEWER: "Viewer",
};

export default function RoleSelector({
	onRoleChange,
	defaultValue = "USER",
	disabled = false,
}: RoleSelectorProps) {
	const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER" | "VIEWER">(
		defaultValue,
	);

	const handleRoleSelect = (role: "ADMIN" | "USER" | "VIEWER") => {
		if (disabled) return;
		setSelectedRole(role);
		onRoleChange(role);
	};

	return (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-1.5">
				{(["ADMIN", "USER", "VIEWER"] as const).map((role) => (
					<button
						key={role}
						type="button"
						onClick={() => handleRoleSelect(role)}
						disabled={disabled}
						className={clsx(
							"text-xs font-medium px-0.5 py-0.5 min-w-10 rounded-sm transition-colors",
							selectedRole === role
								? roleStyles[role]
								: `${StyleTheme.Container.BackgroundMuted} text-zinc-400 border ${StyleTheme.Container.Border.Subtle} hover:border-zinc-600/50`,
							disabled && "opacity-50 cursor-not-allowed",
							!disabled && "cursor-pointer",
						)}
						aria-pressed={selectedRole === role}
						aria-label={`Select ${roleLabels[role]} role`}
					>
						{roleLabels[role]}
					</button>
				))}
			</div>
		</div>
	);
}
