import { Suspense } from "react";
import ConversationsContent from "./ConversationsContent";

export default function ConversationsPage() {
  return (
    <Suspense fallback={<div><p>Loading...</p></div>}>
      <ConversationsContent />
    </Suspense>
  );
}