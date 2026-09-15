import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ConvexRealtimeDemo() {
  const [text, setText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string>();
  const notes = useQuery(api.demo.listNotes, {});
  const addNote = useMutation(api.demo.addNote);

  const submit: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!text.trim() || isAdding) return;
    setIsAdding(true);
    setError(undefined);
    try {
      await addNote({ text });
      setText("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La note n’a pas pu être ajoutée.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Notes partagées en temps réel</CardTitle>
        <CardDescription>
          Ouvrez cette page dans deux onglets. Une note ajoutée dans l’un
          apparaît dans l’autre sans rechargement ni polling.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex gap-2" onSubmit={submit}>
          <Input
            aria-label="Nouvelle note partagée"
            maxLength={160}
            onChange={(event) => setText(event.target.value)}
            placeholder="Écrivez une courte note…"
            value={text}
          />
          <Button disabled={isAdding || !text.trim()} type="submit">
            {isAdding ? "Ajout…" : "Ajouter"}
          </Button>
        </form>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {notes === undefined ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li className="rounded-md border p-3" key={note._id}>
                <p>{note.text}</p>
                {note.authorName ? (
                  <p className="mt-1 text-xs text-muted-foreground">{note.authorName}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
