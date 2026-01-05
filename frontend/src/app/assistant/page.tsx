import dynamic from 'next/dynamic';

const AssistantPage = dynamic(() => import('./ClientPage'), {
  ssr: false,
  loading: () => <div className="p-8 text-sm text-gray-500">Loading assistant...</div>,
});

export default function Page() {
  return <AssistantPage />;
}
