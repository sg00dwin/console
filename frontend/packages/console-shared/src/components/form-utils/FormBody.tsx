import * as React from 'react';
import * as classNames from 'classnames';

type FormBodyProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  flexLayout?: boolean;
};

const FormBody: React.FC<FormBodyProps & React.HTMLProps<HTMLDivElement>> = ({
  children,
  className,
  style,
  flexLayout = false,
  ...props
}) => (
  <div
    {...props}
    // className={className}
    className={classNames('violet', className)}
    style={
      flexLayout
        ? { display: 'flex', flex: 1, flexDirection: 'column', paddingBottom: 0, ...(style ?? {}) }
        : { paddingBottom: 0, ...(style ?? {}) }
    }
  >
    {children}
  </div>
);

export default FormBody;
