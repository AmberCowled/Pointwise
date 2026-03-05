"use client";

import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import type { MemberBreakdownItem } from "@pointwise/lib/validation/analytics-schema";
import Image from "next/image";

interface MemberTableProps {
	members: MemberBreakdownItem[];
}

export default function MemberTable({ members }: MemberTableProps) {
	if (members.length === 0) {
		return (
			<p className={`text-sm text-center py-8 ${StyleTheme.Text.Secondary}`}>
				No member data available
			</p>
		);
	}

	return (
		<div className="w-full overflow-x-auto">
			<table className="w-full text-xs">
				<thead>
					<tr className={`border-b ${StyleTheme.Container.Border.Primary}`}>
						<th
							className={`text-left py-2 px-2 font-semibold ${StyleTheme.Text.Secondary}`}
						>
							Member
						</th>
						<th
							className={`text-right py-2 px-2 font-semibold ${StyleTheme.Text.Secondary}`}
						>
							Completed
						</th>
						<th
							className={`text-right py-2 px-2 font-semibold ${StyleTheme.Text.Secondary}`}
						>
							XP
						</th>
						<th
							className={`text-right py-2 px-2 font-semibold ${StyleTheme.Text.Secondary}`}
						>
							Rate
						</th>
						<th
							className={`text-right py-2 px-2 font-semibold ${StyleTheme.Text.Secondary} hidden sm:table-cell`}
						>
							Avg Time
						</th>
						<th
							className={`text-right py-2 px-2 font-semibold ${StyleTheme.Text.Secondary} hidden sm:table-cell`}
						>
							Streak
						</th>
					</tr>
				</thead>
				<tbody>
					{members
						.sort((a, b) => b.tasksCompleted - a.tasksCompleted)
						.map((member) => (
							<tr
								key={member.userId}
								className={`border-b ${StyleTheme.Container.Border.Secondary} hover:bg-white/5`}
							>
								<td
									className={`py-2 px-2 ${StyleTheme.Text.Primary} flex items-center gap-2`}
								>
									{member.image ? (
										<Image
											src={member.image}
											alt=""
											width={20}
											height={20}
											className="w-5 h-5 rounded-full"
										/>
									) : (
										<div className="w-5 h-5 rounded-full bg-zinc-700" />
									)}
									<span className="truncate max-w-[120px]">
										{member.displayName}
									</span>
								</td>
								<td
									className={`text-right py-2 px-2 ${StyleTheme.Text.Primary}`}
								>
									{member.tasksCompleted}
								</td>
								<td
									className={`text-right py-2 px-2 ${StyleTheme.Text.Primary}`}
								>
									{member.totalXpEarned.toLocaleString()}
								</td>
								<td
									className={`text-right py-2 px-2 ${StyleTheme.Text.Primary}`}
								>
									{member.completionRate}%
								</td>
								<td
									className={`text-right py-2 px-2 ${StyleTheme.Text.Secondary} hidden sm:table-cell`}
								>
									{member.averageCompletionTimeHours
										? `${member.averageCompletionTimeHours}h`
										: "—"}
								</td>
								<td
									className={`text-right py-2 px-2 ${StyleTheme.Text.Secondary} hidden sm:table-cell`}
								>
									{member.currentStreak}d
								</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
}
