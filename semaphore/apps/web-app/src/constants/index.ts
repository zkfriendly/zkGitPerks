// @ts-ignore
if (!import.meta.env.VITE_GROUP_ID) {
    throw Error("VITE_GROUP_ID env not provided")
}
// @ts-ignore
// eslint-disable-next-line import/prefer-default-export
export const GROUP_ID: string = import.meta.env.VITE_GROUP_ID
export const PR_CIRCUIT_ID: string = "8131068d-2680-49f8-b35f-33831cad66e5"
export const ZKBILL_CIRCUIT_ID: string = "eda66e6f-2b97-4fa4-94df-594eaa9e03d7"
export const HEROKU_CIRCUIT_ID: string = "2882fdf6-9413-4940-b521-d7943b969a8b"
