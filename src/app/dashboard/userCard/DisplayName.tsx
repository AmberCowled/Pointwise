interface DisplayNameProps {
	displayName: string;
	href: string;
}

export default function DisplayName({ displayName, href }: DisplayNameProps) {
	return (
		<a
			href={href}
			className="text-zinc-300 text-sm font-semibold hover:underline cursor-pointer"
		>
			{displayName}
		</a>
	);
}
