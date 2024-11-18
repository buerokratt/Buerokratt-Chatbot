import Markdown from 'markdown-to-jsx';

const Markdownify = (props: { message: string | undefined }): JSX.Element => {
  const { message = '' } = props;

  return (
    <div>
      <Markdown target="_blank" options={{ enforceAtxHeadings: true }}>
        {message ?? ''}
      </Markdown>
    </div>
  );
};

export default Markdownify;
