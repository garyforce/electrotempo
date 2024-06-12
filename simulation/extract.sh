#!/bin/bash
for file in "$@"; do
    tar -xvaf "$file" 2>/dev/null && 
        return 0
    case $(file "$file") in
        # *bzip2*)    bzip2 -dk "$file"        ;;
        *gzip*)     gunzip "$file"           ;;
        *'7-zip'*)  7z x "$file"             ;;
        *zip*)                               ;&
        *Zip*)      unzip "$file"            ;;
        *xz*)                                ;&
        *XZ*)       unxz  "$file"            ;;
        *)          1>&2 echo "Unknown archive '$file'"; return 1 ;;
    esac
done
