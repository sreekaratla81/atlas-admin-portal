import { useEffect, useRef, useState } from 'react';
import { TextField, Autocomplete, CircularProgress, Box, Typography } from '@mui/material';
import { getAllGuests, type GuestSummary } from '@/db/idb';
import { hydrateGuests } from '@/services/guests.local';
import SearchWorker from '@/workers/guestSearch.worker?worker';

type Props = { onSelect(g: GuestSummary): void; onAddNew?: ()=>void; };
export default function GuestTypeahead({ onSelect, onAddNew }: Props){
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<GuestSummary[]>([]);
  const [ready, setReady] = useState(false);
  const workerRef = useRef<Worker>();
  const debounceRef = useRef<number>();

  useEffect(()=>{ // hydrate once
    (async()=>{
      setLoading(true);
      try { await hydrateGuests(false); } finally { setLoading(false); setReady(true); }
    })();
    if (typeof Worker !== 'undefined') {
      workerRef.current = new SearchWorker();
      return ()=>workerRef.current?.terminate();
    }
    return;
  },[]);

  useEffect(()=>{
    if (!ready) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async ()=>{
      setLoading(true);
      const all = await getAllGuests();
      const start = performance.now();
      workerRef.current!.onmessage = (e:any)=>{
        setOptions(e.data.results);
        setLoading(false);
        if (import.meta.env.DEV) {
          console.log('search latency', Math.round(performance.now()-start),'ms', 'results', e.data.results.length);
        }
      };
      workerRef.current!.postMessage({ q: input, data: all });
    }, 280);
  }, [input, ready]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(o)=> (typeof o==='string' ? o : (o.name || ''))}
      onInputChange={(_,v)=>setInput(v)}
      onChange={(_,v)=>{ if (v && typeof v !== 'string') onSelect(v as any); }}
      loading={loading}
      filterOptions={(x)=>x}
      renderInput={(params)=>(
        <TextField {...params} label="Search guest by name or phone" InputProps={{
          ...params.InputProps, endAdornment:(<>
            {loading ? <CircularProgress size={18}/> : null}
            {params.InputProps.endAdornment}
          </>)
        }}/>
      )}
      renderOption={(props, g)=>(
        <Box component="li" {...props}>
          <Box sx={{display:'flex',flexDirection:'column'}}>
            <Typography fontWeight={600}>{g.name}</Typography>
            <Typography variant="caption">{[g.phone, g.email].filter(Boolean).join(' • ')}</Typography>
          </Box>
        </Box>
      )}
      ListboxProps={{ style: { maxHeight: 320 } }}
      noOptionsText={
        <Box sx={{px:2, py:1}}>
          <Typography>No guest found.</Typography>
          {onAddNew && (
            <Typography sx={{color:'primary.main', cursor:'pointer'}} onClick={onAddNew}>
              + Add new guest
            </Typography>
          )}
        </Box>
      }
    />
  );
}
