/**
 * A subset of the XML Schema data types
 */
export default class XSD {
    /**
     * The namespace of the Vocabulary
     **/
    static NAMESPACE = 'http://www.w3.org/2001/XMLSchema#';
    /**
     * A common prefix for the Vocabulary
     **/
    static PREFIX = 'xsd';

    /**
     * XML Schema data type
     **/
    static DATE = XSD.NAMESPACE + 'date';

    /**
     * XML Schema data type
     **/
    static BOOLEAN = XSD.NAMESPACE + 'boolean';
}
