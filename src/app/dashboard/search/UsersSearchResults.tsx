import { Card } from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Grid from "@pointwise/app/components/ui/Grid";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useSearchUsersQuery } from "@pointwise/generated/api";
import { IoSearchOutline } from "react-icons/io5";
import UserCard from "../userCard/UserCard";

interface UsersSearchResultsProps {
	query: string;
}

export default function UsersSearchResults({ query }: UsersSearchResultsProps) {
	const {
		data: usersSearchResults,
		isLoading: isUsersLoading,
		isError: isUsersError,
		refetch: refetchUsers,
	} = useSearchUsersQuery({
		query,
		limit: 10,
		offset: 0,
	});

	const users = usersSearchResults?.users ?? [];
	const usersCount = usersSearchResults?.pagination.total ?? 0;

	return (
		<Card label={`${usersCount} results`} loading={isUsersLoading}>
			<Container direction="vertical" gap="sm" width="full" className="mt-3">
				<ErrorCard
					message="Something went wrong"
					onRetry={refetchUsers}
					display={isUsersError}
				/>
				{!isUsersError && usersCount > 0 ? (
					<Grid columns={{ default: 1, sm: 2, md: 3 }} gap="sm">
						{users.map((user) => (
							<UserCard key={user.id} user={user} />
						))}
					</Grid>
				) : (
					<Container
						width="full"
						direction="vertical"
						gap="sm"
						className={`py-8 ${StyleTheme.Text.Secondary} ${StyleTheme.Container.BackgroundSubtle} rounded-sm border ${StyleTheme.Container.Border.Subtle}`}
					>
						<IoSearchOutline className="size-10 mb-2" />
						<span className="font-medium text-lg">No users found</span>
					</Container>
				)}
			</Container>
		</Card>
	);
}
