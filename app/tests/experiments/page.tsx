
// app > tests > experiments
'use client'
import { $Chemical, $ } from '@/chemistry';

class $Book extends $Chemical {
    first!: $<'div'>;
    second = $($Chemical);
    third = $($Chemical, '[]');
    rest: $<any>[] = [];
    $Book(first: $<'div'>, second: $Chemical, third: $Chemical[], ...rest: $<any>[]) {
        this.first = first;
        this.second = second;
        this.third = third;
        this.rest = rest;
    }
}