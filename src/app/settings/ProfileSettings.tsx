import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import Input from "@pointwise/app/components/ui/Input";
import InputArea from "@pointwise/app/components/ui/InputArea";
import ProfilePicture from "@pointwise/app/dashboard/userCard/ProfilePicture";
import { IoCloudUpload, IoSave, IoTrashBin } from "react-icons/io5";

export default function ProfileSettings() {
	return (
		<Container direction="vertical" width="full" className="py-4">
			<Grid columns={{ default: 1, sm: 2 }}>
				<Container width="full">
					<Container>
						<ProfilePicture profilePicture="" displayName="Amber" size="xl" />
						<Container direction="vertical" width="full" gap="sm">
							<Button className="w-full rounded-none">
								<IoCloudUpload />
								Upload New
							</Button>
							<Button variant="secondary" className="w-full rounded-none">
								<IoTrashBin />
								Remove
							</Button>
						</Container>
					</Container>
				</Container>
			</Grid>

			<Container direction="vertical">
				<Grid columns={{ default: 1, sm: 3 }}>
					<Container width="full">
						<Input label="Username" flex="grow" className="rounded-none" />
					</Container>
					<Container width="full">
						<Input label="Email" flex="grow" className="rounded-none" />
					</Container>
					<Container width="full">
						<Input label="Full Name" flex="grow" className="rounded-none" />
					</Container>
				</Grid>

				<Container width="full">
					<InputArea
						flex="grow"
						label="Bio"
						className="rounded-none"
						rows={5}
					/>
				</Container>

				<Grid columns={{ default: 1, sm: 3 }}>
					<Container width="full">
						<Input label="Location" flex="grow" className="rounded-none" />
					</Container>
					<Container width="full">
						<Input label="Website" flex="grow" className="rounded-none" />
					</Container>
				</Grid>

				<Container width="full" className="pb-3 border-b border-zinc-800">
					<span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
						Public Profile
					</span>
					<label className="relative inline-flex cursor-pointer">
						<input type="checkbox" className="sr-only peer" defaultChecked />
						<div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-500/75 transition-colors" />
						<div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
					</label>
				</Container>

				<Container width="full" className="justify-center">
					<Grid columns={{ default: 1, sm: 3 }}>
						<Button className="w-full rounded-none">
							<IoSave />
							Save Changes
						</Button>
					</Grid>
				</Container>
			</Container>
		</Container>
	);
}
