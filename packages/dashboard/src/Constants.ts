export const ROLE_PUBLISHER = "publisher";
export const ROLE_ADMIN = "admin";
export const ROLE_ISSUER = 'issuer';
interface NamedPath {
  name: string;
  path: string;
} 

export const ROLES_PAGES: {[route: string]: Array<NamedPath>} = {
  [ROLE_PUBLISHER]: [
    {
      name: "Dashboard",
      path: "/publishers",
    },
    {
      name: "My Content",
      path: "/mycontent",
    },
  ],
  [ROLE_ADMIN]: [],
  [ROLE_ISSUER]:[]
};
export const ROLES_DEFAULT_ROUTES: {[route: string]: string} = {
  [ROLE_PUBLISHER]: "/publishers",
  [ROLE_ADMIN]: "/admin",
  [ROLE_ISSUER]: "/issuer",
};

export const LS_KEY_TOKEN = "t";
export const LS_KEY_ROLE = "r";

export const credential_mobile = "credential_mobile";

export const credential_email = "credential_email";

export const credential_address = "credential_address";

export const credential_birthday = "credential_birthday";

export const CREDENTIAL_SUPPORT_ZKP = [
  credential_birthday,
  credential_address
];

export const CONDITION_TYPE_TO_CREDENTIAL: {[condition: string]: string} = {
  age: credential_birthday,
  nationality: credential_address,
};

export const NORMALIZE_AMOUNT = 100;
export const AMOUNT_TO_DISPLAY = (amount: number) => amount / NORMALIZE_AMOUNT;
export const AMOUNT_TO_STORE = (amount: number) => amount * NORMALIZE_AMOUNT;
