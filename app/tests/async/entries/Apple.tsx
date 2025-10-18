// app/tests/async/entries/Apple.tsx
import { $DictionaryEntry } from '../loading-tests';

export class $Apple extends $DictionaryEntry {
    title = 'Apple';
    examples = ['Granny Smith', 'Red Delicious', 'Honeycrisp'];
    
    definition() {
        return (
            <>
                <p>A round fruit produced by an apple tree, typically red, yellow, or green.</p>
                <small>Examples: {this.examples.join(', ')}</small>
            </>
        );
    }
}

export const Apple = new $Apple().Component;
export default Apple;