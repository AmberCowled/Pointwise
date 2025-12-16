/* 
  This file is a placeholder for the user XP route.
  It will be used to get a specific users XP after doing a privacy level check
  If the specified users ID is a public account then return the XP of the specified user.
  Otherwise check if the specified users ID is in any of the projects the authenticated user is in.
  If so, return the XP of the specified user.
  Otherwise return an empty object or appropriate data.
*/

import { jsonResponse } from "@pointwise/lib/api/route-handler";

export async function GET() {
	//TODO: Implement privacy levels for accounts and function logic...
	return jsonResponse({ xp: 0 });
}
