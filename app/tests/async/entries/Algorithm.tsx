// app/tests/async/entries/Algorithm.tsx
import { $DictionaryEntry } from '../loading-tests';

export class $Algorithm extends $DictionaryEntry {
    title = 'Algorithm';
    examples = ['Bubble sort', 'Binary search', "Dijkstra's algorithm"];
    
    definition() {
        return (
            <>
                <p>A finite sequence of well-defined instructions to solve a class of problems or perform a computation.</p>
                <small>Examples: {this.examples.join(', ')}</small>
            </>
        );
    }
}

export const Algorithm = new $Algorithm().Component;
export default Algorithm;