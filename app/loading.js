export default function Loading() {
    // Returning null for the root loader ensures we don't have redundant spinners.
    // Major routes like /menus and /t/ have their own specialized skeletons.
    return null;
}
