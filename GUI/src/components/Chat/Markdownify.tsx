import Markdown from 'markdown-to-jsx';

const Markdownify = (props: { message: string | undefined }): JSX.Element => {
  const { message = '' } = props;

  return (
    <div>
      <Markdown options={{ enforceAtxHeadings: true, overrides: { a: { props: { target: "_blank" } } } }}>
        {message ?? ''}
      </Markdown>
    </div>
  );
};

export default Markdownify;
