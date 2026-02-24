import { supabase } from '@/lib/supabase';
import MenuList from '@/components/Home/MenuList';
import styles from './page.module.css';

async function getMenus() {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
  return data;
}

export default async function Home() {
  const menus = await getMenus();

  return (
    <div className={styles.container}>
      <MenuList initialMenus={menus} />
    </div>
  );
}
