import Linkify from 'linkify-react';

const Linkifier = (props: { message: string | undefined }): JSX.Element => {
  const { message = '' } = props;

  const regex = /(http(s)?):\/\/([a-zõäöüA-ZÕÄÖÜ0-9.-]+[\\/]?)+$/;
  return (
    <div>
      <Linkify
        options={{
          attributes: { target: '_blank' },
          defaultProtocol: 'https',
          validate: {
            url: (value: string) => regex.test(value),
            email: false,
          },
        }}
      >
        {message}
      </Linkify>
    </div>
  );
};

export default Linkifier;
