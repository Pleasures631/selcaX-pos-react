import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  username: Yup.string().email("Email tidak valid").required("Wajib diisi"),
  password: Yup.string().min(6, "Minimal 6 karakter").required("Wajib diisi"),
});
