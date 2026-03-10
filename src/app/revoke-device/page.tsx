import { Suspense } from "react";
import Page from "../components/ui/Page";
import RevokeDeviceClient from "./RevokeDeviceClient";

export default function RevokeDevicePage() {
	return (
		<Page className="flex items-center justify-center px-4">
			<Suspense
				fallback={<div className="text-zinc-500 text-sm">Loading...</div>}
			>
				<RevokeDeviceClient />
			</Suspense>
		</Page>
	);
}
