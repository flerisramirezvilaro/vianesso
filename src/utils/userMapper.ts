import { UserDocument } from "../types/user.types";

export const mapUserToResponse = (user: UserDocument) => ({
  id: user.user_id,
  name: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar_url: user.avatar_url,
});
