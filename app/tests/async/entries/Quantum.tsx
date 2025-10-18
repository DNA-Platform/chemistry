// app/tests/async/entries/Quantum.tsx
import { $DictionaryEntry } from '../loading-tests';

export class $Quantum extends $DictionaryEntry {
    title = 'Quantum';
    examples = ['Quantum leap', 'Quantum entanglement', 'Quantum computing'];
    
    definition() {
        return (
            <>
                <p>The minimum amount of any physical entity involved in an interaction; relating to quantum mechanics.</p>
                <small>Examples: {this.examples.join(', ')}</small>
            </>
        );
    }
}

export const Quantum = new $Quantum().Component;
export default Quantum;