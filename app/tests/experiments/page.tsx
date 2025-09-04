
// app > tests > experiments
'use client'
import { $Chemical, where, parent } from '@/chemistry2';

class $Book extends $Chemical {

}

class $Chapter extends $Chemical {
    @parent($Book)
    book!: $Book; //Automatically assigns this from parent
}