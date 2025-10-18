// app/tests/async/entries/Banana.tsx
import { $DictionaryEntry } from '../loading-tests';

export class $Banana extends $DictionaryEntry {
    title = 'Banana';
    examples = ['Cavendish', 'Plantain', 'Red banana'];
    
    definition() {
        return (
            <>
                <p>An elongated, curved tropical fruit with soft pulpy flesh and yellow skin when ripe.</p>
                <small>Examples: {this.examples.join(', ')}</small>
            </>
        );
    }
}

export const Banana = new $Banana().Component;
export default Banana;