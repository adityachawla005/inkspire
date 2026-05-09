import { IStroke } from "../types/animationTypes";

export class HistoryManager {
    private undoStack: IStroke[][] = [];
    private redoStack: IStroke[][] = [];

    save(strokes: IStroke[]) {
        const snapshot = strokes.map(s => ({
            points: s.points.map(p => [...p]),
            radii:  [...s.radii],
            color:  [...s.color],
        }));
        this.undoStack.push(snapshot);
        this.redoStack = [];
    }

    undo(current: IStroke[]): IStroke[] | null {
        if (!this.undoStack.length) return null;
        this.redoStack.push(current.map(s => ({
            points: s.points.map(p => [...p]),
            radii:  [...s.radii],
            color:  [...s.color],
        })));
        return this.undoStack.pop()!;
    }

    redo(current: IStroke[]): IStroke[] | null {
        if (!this.redoStack.length) return null;
        this.undoStack.push(current.map(s => ({
            points: s.points.map(p => [...p]),
            radii:  [...s.radii],
            color:  [...s.color],
        })));
        return this.redoStack.pop()!;
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
