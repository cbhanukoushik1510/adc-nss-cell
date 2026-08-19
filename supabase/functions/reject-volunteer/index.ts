import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
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
        error:
          "Only POST requests are allowed.",
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
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
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

    const supabaseAdmin =
      createClient(
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
          error:
            "Invalid request body.",
        },
        400
      );
    }

    const volunteerId =
      typeof body?.volunteerId ===
      "string"
        ? body.volunteerId.trim()
        : "";

    const rejectionReason =
      typeof body?.rejectionReason ===
      "string"
        ? body.rejectionReason.trim()
        : "";

    /* ==========================================
       VALIDATION
    ========================================== */

    if (!volunteerId) {
      return jsonResponse(
        {
          success: false,
          error:
            "Volunteer ID is required.",
        },
        400
      );
    }

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
       1. LOAD COMPLETE VOLUNTEER
    ========================================== */

    const {
      data: volunteer,
      error: volunteerError,
    } =
      await supabaseAdmin
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
      "Complete volunteer loaded:",
      volunteer.id
    );

    /* ==========================================
       2. GET ADMIN USER
       
       The request is coming from the logged-in
       admin through Supabase Functions.
       
       We try to identify the caller so
       rejected_by contains the admin user ID.
    ========================================== */

    let rejectedBy: string | null =
      null;

    const authHeader =
      req.headers.get(
        "Authorization"
      );

    if (authHeader) {
      const accessToken =
        authHeader.replace(
          "Bearer ",
          ""
        );

      if (accessToken) {
        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabaseAdmin.auth.getUser(
            accessToken
          );

        if (userError) {
          console.warn(
            "Could not identify rejecting admin:",
            userError.message
          );
        } else if (user) {
          rejectedBy = user.id;
        }
      }
    }

    /* ==========================================
       3. CREATE COMPLETE REJECTION SNAPSHOT
    ========================================== */

    /*
     * volunteer_data contains the COMPLETE
     * volunteer application exactly as it existed
     * before rejection.
     *
     * This is what allows the admin to review
     * the rejected application later.
     */

    const rejectionSnapshot = {
      ...volunteer,
    };

    const {
      data: rejectionRecord,
      error: rejectionInsertError,
    } =
      await supabaseAdmin
        .from("volunteer_rejections")
                .insert({
          volunteer_id: volunteer.id,

          full_name: volunteer.full_name,

          roll_number: volunteer.roll_number,

          college_email: volunteer.college_email,

          rejection_reason: rejectionReason,

          rejected_by: rejectedBy,

          volunteer_data: rejectionSnapshot,

          rejected_at: new Date().toISOString(),

          created_at: new Date().toISOString(),
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
            "Could not save the rejection history.",
          details:
            rejectionInsertError.message,
          code:
            rejectionInsertError.code,
        },
        500
      );
    }

    console.log(
      "Complete rejection snapshot saved:",
      rejectionRecord.id
    );

    /* ==========================================
       4. DELETE AUTH ACCOUNT
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
         * The rejection snapshot is still
         * useful, but because the rejection
         * operation did not finish, remove it.
         */

        await supabaseAdmin
          .from(
            "volunteer_rejections"
          )
          .delete()
          .eq(
            "id",
            rejectionRecord.id
          );

        return jsonResponse(
          {
            success: false,
            error:
              "The volunteer account could not be removed. The application was not rejected.",
            details:
              deleteAuthError.message,
          },
          500
        );
      }

      console.log(
        "Auth account deleted successfully."
      );
    }

    /* ==========================================
       5. DELETE ACTIVE VOLUNTEER
    ========================================== */

    const {
      error: deleteVolunteerError,
    } =
      await supabaseAdmin
        .from("volunteers")
        .delete()
        .eq(
          "id",
          volunteer.id
        );

    if (deleteVolunteerError) {
      console.error(
        "Volunteer deletion error:",
        deleteVolunteerError
      );

      /*
       * DO NOT delete the rejection record.
       *
       * It contains the complete application
       * snapshot and rejection reason.
       */

      return jsonResponse(
        {
          success: false,
          error:
            "The volunteer account was removed, but the active volunteer record could not be deleted.",
          details:
            deleteVolunteerError.message,
          rejectionId:
            rejectionRecord.id,
        },
        500
      );
    }

    console.log(
      "Active volunteer deleted successfully."
    );

    /* ==========================================
       6. SUCCESS
    ========================================== */

    return jsonResponse(
      {
        success: true,

        message:
          "Application rejected successfully.",

        rejectionId:
          rejectionRecord.id,

        volunteerId:
          volunteer.id,

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