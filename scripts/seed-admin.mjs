import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const p = "./.env.local";
  if (fs.existsSync(p)) {
    const s = fs.readFileSync(p, "utf8");
    s.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        let val = m[2] ?? "";
        // Remove optional surrounding quotes
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE config in env or .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const ADMIN_EMAIL = "samueljay280@gmail.com";
const ADMIN_PASSWORD = "T#?M@hSFZeW7&ue";

async function main() {
  try {
    console.log("Creating admin user...", ADMIN_EMAIL);
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) {
      console.error("createUser error:", error.message || error);
    } else {
      console.log("User created:", data?.user?.id ?? data);
    }

    // Attempt to determine the user id
    let userId = data?.user?.id;

    try {
      if (!userId && supabase.auth.admin.listUsers) {
        const { data: listData, error: listErr } =
          await supabase.auth.admin.listUsers();
        if (!listErr && listData?.users) {
          const found = listData.users.find((u) => u.email === ADMIN_EMAIL);
          if (found) userId = found.id;
        }
      }
    } catch (_) {}

    // If the user already existed, reset their password to the one defined here
    if (userId && error) {
      console.log("User already exists — resetting password...");
      const { error: updateErr } = await supabase.auth.admin.updateUserById(
        userId,
        { password: ADMIN_PASSWORD },
      );
      if (updateErr) console.error("Password reset error:", updateErr.message);
      else console.log("Password reset successfully.");
    }

    if (!userId) {
      console.error(
        "Could not determine user id; check Supabase console. Exiting.",
      );
      process.exit(1);
    }

    console.log("Upserting profile for user id", userId);
    const { data: profile, error: profileErr } = await supabase
      .from("users")
      .upsert(
        { id: userId, email: ADMIN_EMAIL, role: "admin" },
        { returning: "representation" },
      );
    if (profileErr) console.error("profile upsert error:", profileErr);
    else console.log("Profile upserted:", profile);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
