import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchBar = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for dresses, tops, accessories..."
          className="w-full pr-10"
        />
        <Button variant="ghost" size="icon" className="absolute right-0 top-0">
          <Search className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;