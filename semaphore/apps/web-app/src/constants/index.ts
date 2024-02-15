// @ts-ignore
if (!import.meta.env.VITE_GROUP_ID) {
    throw Error("VITE_GROUP_ID env not provided")
}
// @ts-ignore
// eslint-disable-next-line import/prefer-default-export
export const GROUP_ID: string = import.meta.env.VITE_GROUP_ID
export const PR_CIRCUIT_ID: string = "8131068d-2680-49f8-b35f-33831cad66e5"
