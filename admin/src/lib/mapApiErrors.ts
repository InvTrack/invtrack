export const mapApiErrors = (error: Error): string | null => {
    // TODO: replace using https://github.com/joeldomke/supabase-errors-js
    if (error.message === "Invalid login credentials") {
      return "Email lub hasło niepoprawne!";
    }
    if (error.message === "User already registered") {
      return "Email już wykorzystany!";
    }
    if (error.message.includes("Password should be at least")) {
      return "Hasło powinno zawierać minimum 6 znaków!";
    }
    return null;
}