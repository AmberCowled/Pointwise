"use client";

import Container from "@pointwise/app/components/ui/Container";
import { useGetUserPostsQuery } from "@pointwise/generated/api";
import PostItem from "./PostItem";

export interface PostListProps {
	userId: string;
}

export default function PostList({ userId }: PostListProps) {
	const { data, isLoading } = useGetUserPostsQuery({ userId });

	if (isLoading) {
		return (
			<p className="text-sm text-zinc-500 text-center py-4">Loading posts...</p>
		);
	}

	if (!data?.posts.length) {
		return null;
	}

	return (
		<Container
			direction="vertical"
			width="full"
			gap="sm"
			className="items-stretch"
		>
			{data.posts.map((post) => (
				<PostItem key={post.id} post={post} userId={userId} />
			))}
		</Container>
	);
}
