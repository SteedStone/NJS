import { Suspense } from "react";
import FormClient from "./FormClient";

export default function FormPage() {
  return (
    <Suspense fallback={<p>Chargement du formulaire...</p>}>
      <FormClient />
    </Suspense>
  );
}
