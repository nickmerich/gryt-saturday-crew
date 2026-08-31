import { createServerFn } from "@tanstack/react-start";

export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhotoUrl?: string;
};

export type GoogleReviewsPayload = {
  configured: boolean;
  rating: number | null;
  total: number;
  mapsUrl: string | null;
  reviews: GoogleReview[];
};

const EMPTY: GoogleReviewsPayload = {
  configured: false,
  rating: null,
  total: 0,
  mapsUrl: null,
  reviews: [],
};

/**
 * Reads reviews for the club's Google Business listing.
 * Requires GOOGLE_PLACES_API_KEY and GOOGLE_PLACES_PLACE_ID on the server.
 */
export const getGoogleReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<GoogleReviewsPayload> => {
    const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
    const placeId = process.env["GOOGLE_PLACES_PLACE_ID"];
    if (!apiKey || !placeId) return EMPTY;

    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "rating,userRatingCount,googleMapsUri,reviews",
          },
        },
      );
      if (!res.ok) {
        console.error(`Google Places request failed [${res.status}]`);
        return EMPTY;
      }
      const data = (await res.json()) as {
        rating?: number;
        userRatingCount?: number;
        googleMapsUri?: string;
        reviews?: Array<{
          rating?: number;
          text?: { text?: string };
          originalText?: { text?: string };
          relativePublishTimeDescription?: string;
          authorAttribution?: { displayName?: string; photoUri?: string };
        }>;
      };

      const reviews: GoogleReview[] = (data.reviews ?? [])
        .map((r) => ({
          author: r.authorAttribution?.displayName ?? "Google user",
          rating: r.rating ?? 0,
          text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
          relativeTime: r.relativePublishTimeDescription ?? "",
          profilePhotoUrl: r.authorAttribution?.photoUri,
        }))
        .filter((r) => r.text.length > 0);

      return {
        configured: true,
        rating: data.rating ?? null,
        total: data.userRatingCount ?? 0,
        mapsUrl: data.googleMapsUri ?? null,
        reviews,
      };
    } catch (err) {
      console.error("Google Places request errored", err);
      return EMPTY;
    }
  },
);
