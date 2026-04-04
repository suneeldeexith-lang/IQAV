import { Loader2 } from 'lucide-react';

const Loader = ({ text = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400 w-full h-full min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
      <p className="font-medium">{text}</p>
    </div>
  );
};
export default Loader;
