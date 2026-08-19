import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  /* ==========================================
     CORS
  ========================================== */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Only POST requests are allowed.",
      },
      405
    );
  }

  try {
    /* ==========================================
       ENVIRONMENT
    ========================================== */

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Missing Supabase environment variables."
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Supabase server configuration is missing.",
        },
        500
      );
    }

    /* ==========================================
       ADMIN CLIENT
    ========================================== */

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /* ==========================================
       READ REQUEST BODY
    ========================================== */

    let body: any;

    try {
      body = await req.json();
    } catch (error) {
      console.error(
        "Invalid JSON body:",
        error
      );

      return jsonResponse(
        {
          success: false,
          error: "Invalid request body.",
        },
        400
      );
    }

    console.log(
      "Reject volunteer request body:",
      body
    );

    /* ==========================================
       GET VALUES
    ========================================== */

    const volunteerId =
      typeof body?.volunteerId === "string"
        ? body.volunteerId.trim()
        : "";

    const rejectionReason =
      typeof body?.rejectionReason === "string"
        ? body.rejectionReason.trim()
        : "";

    console.log(
      "Volunteer ID:",
      volunteerId
    );

    console.log(
      "Rejection reason:",
      rejectionReason
    );

    /* ==========================================
       VALIDATE VOLUNTEER ID
    ========================================== */

    if (!volunteerId) {
      return jsonResponse(
        {
          success: false,
          error: "Volunteer ID is required.",
        },
        400
      );
    }

    /* ==========================================
       VALIDATE REJECTION REASON
    ========================================== */

    if (!rejectionReason) {
      return jsonResponse(
        {
          success: false,
          error:
            "Rejection reason is required.",
        },
        400
      );
    }

    /* ==========================================
       1. GET VOLUNTEER
    ========================================== */

    const {
      data: volunteer,
      error: volunteerError,
    } = await supabaseAdmin
      .from("volunteers")
      .select("*")
      .eq("id", volunteerId)
      .maybeSingle();

    if (volunteerError) {
      console.error(
        "Volunteer lookup error:",
        volunteerError
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Could not load volunteer application.",
          details:
            volunteerError.message,
        },
        500
      );
    }

    if (!volunteer) {
      console.error(
        "Volunteer not found:",
        volunteerId
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Volunteer application not found.",
        },
        404
      );
    }

    console.log(
      "Volunteer found:",
      volunteer.id
    );

    /* ==========================================
       2. SAVE REJECTION HISTORY
    ========================================== */

    const {
      data: rejectionRecord,
      error: rejectionInsertError,
    } = await supabaseAdmin
      .from("volunteer_rejections")
      .insert({
        volunteer_id: volunteer.id,

        college_email:
          volunteer.college_email,

        full_name:
          volunteer.full_name,

        roll_number:
          volunteer.roll_number,

        rejection_reason:
          rejectionReason,

        rejected_by:
          null,

        volunteer_data:
          volunteer,
      })
      .select()
      .single();

    if (rejectionInsertError) {
      console.error(
        "Rejection history insert error:",
        rejectionInsertError
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Could not save the rejection reason.",
          details:
            rejectionInsertError.message,
          code:
            rejectionInsertError.code,
        },
        500
      );
    }

    console.log(
      "Rejection history saved:",
      rejectionRecord
    );

    /* ==========================================
       3. DELETE AUTH ACCOUNT
    ========================================== */

    if (volunteer.auth_user_id) {
      console.log(
        "Deleting Auth user:",
        volunteer.auth_user_id
      );

      const {
        error: deleteAuthError,
      } =
        await supabaseAdmin.auth.admin.deleteUser(
          volunteer.auth_user_id
        );

      if (deleteAuthError) {
        console.error(
          "Auth deletion error:",
          deleteAuthError
        );

        /*
         * Roll back rejection history
         * because the complete rejection
         * process failed.
         */

        await supabaseAdmin
          .from("volunteer_rejections")
          .delete()
          .eq(
            "volunteer_id",
            volunteer.id
          );

        return jsonResponse(
          {
            success: false,
            error:
              "The volunteer account could not be removed. The application was not deleted.",
            details:
              deleteAuthError.message,
          },
          500
        );
      }

      console.log(
        "Auth account deleted successfully."
      );
    } else {
      console.log(
        "No auth_user_id found. Skipping Auth deletion."
      );
    }

    /* ==========================================
       4. DELETE VOLUNTEER APPLICATION
    ========================================== */

    const {
      error: deleteVolunteerError,
    } = await supabaseAdmin
      .from("volunteers")
      .delete()
      .eq("id", volunteer.id);

    if (deleteVolunteerError) {
      console.error(
        "Volunteer deletion error:",
        deleteVolunteerError
      );

      /*
       * IMPORTANT:
       *
       * The Auth account may already have
       * been deleted at this point.
       *
       * Do NOT delete the rejection history.
       * It contains the reason and application
       * information for administrator records.
       */

      return jsonResponse(
        {
          success: false,
          error:
            "The Auth account was removed, but the volunteer application could not be deleted.",
          details:
            deleteVolunteerError.message,
        },
        500
      );
    }

    console.log(
      "Volunteer application deleted successfully."
    );

    /* ==========================================
       5. SUCCESS
    ========================================== */

    return jsonResponse(
      {
        success: true,
        message:
          "Application rejected successfully.",
        rejectionReason:
          rejectionReason,
      },
      200
    );
  } catch (error) {
    console.error(
      "Reject volunteer unexpected error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          "Something went wrong while rejecting the application.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      500
    );
  }
});